-- ==============================================================================
-- MOTOFIX DATABASE SCHEMA (LIMPIO)
-- Fecha: 10/12/2025
-- Descripción: Estructura completa incluyendo usuarios, talleres, citas y reseñas.
-- ==============================================================================

-- 1. LIMPIEZA INICIAL (CUIDADO: Esto borra todo si se ejecuta)
-- Descomentar solo si necesitas reiniciar la DB desde cero.
/*
DROP VIEW IF EXISTS public.workshops_with_rating;
DROP FUNCTION IF EXISTS search_workshops(text);
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.mechanics CASCADE;
DROP TABLE IF EXISTS public.workshops CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS appointment_status;
DROP TYPE IF EXISTS appointment_source;
*/

-- 2. ENUMS (Tipos de datos personalizados)
CREATE TYPE appointment_status AS ENUM (
  'pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE appointment_source AS ENUM ('web', 'walk_in', 'phone');

-- 3. TABLAS PRINCIPALES

-- [PROFILES] Extensión de la tabla auth.users de Supabase
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'client')) DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [WORKSHOPS] Talleres mecánicos
CREATE TABLE public.workshops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  address TEXT,
  district TEXT,
  city TEXT, -- Ej: Lima, Piura
  phone TEXT, -- Teléfono de contacto del taller
  location_lat FLOAT, 
  location_lng FLOAT,
  opening_time TIME DEFAULT '08:00',
  closing_time TIME DEFAULT '18:00',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  subscription_plan TEXT DEFAULT 'free', -- 'free' o 'pro'
  simultaneous_capacity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Restricción: Talleres Free solo pueden atender 1 moto a la vez
  CONSTRAINT check_free_capacity CHECK (
    (subscription_plan = 'free' AND simultaneous_capacity = 1) OR 
    (subscription_plan = 'pro')
  )
);

-- [MECHANICS] Personal del taller
CREATE TABLE public.mechanics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [SERVICES] Catálogo de servicios
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  price_pe_soles DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [APPOINTMENTS] Citas y Reservas
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id UUID REFERENCES public.workshops(id) NOT NULL,
  service_id UUID REFERENCES public.services(id),
  
  -- Mecánico y Cliente pueden ser NULL (ej. Cliente presencial sin app)
  mechanic_id UUID REFERENCES public.mechanics(id),
  client_id UUID REFERENCES public.profiles(id), 
  client_name TEXT, -- Para clientes "Walk-in" sin cuenta
  
  -- Tiempos
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Estados y Origen
  status appointment_status DEFAULT 'confirmed',
  source appointment_source DEFAULT 'web',
  
  -- Datos de la Moto y Notas
  vehicle_model TEXT, 
  internal_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [REVIEWS] Calificaciones y Comentarios
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) NOT NULL UNIQUE, -- Una reseña por cita
  workshop_id UUID REFERENCES public.workshops(id) NOT NULL,
  client_id UUID REFERENCES public.profiles(id) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SEGURIDAD (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública (Cualquiera puede ver talleres y servicios)
CREATE POLICY "Public read workshops" ON public.workshops FOR SELECT USING (true);
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public read mechanics" ON public.mechanics FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);

-- Políticas de Escritura (Protegidas)
-- Perfiles: Cada usuario crea/edita su propio perfil
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Talleres: Solo dueños crean y editan sus talleres
CREATE POLICY "Users create workshops" ON public.workshops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update workshops" ON public.workshops FOR UPDATE USING (auth.uid() = owner_id);

-- Citas: 
-- 1. Clientes ven sus citas, Dueños ven las citas de su taller
CREATE POLICY "See own appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT owner_id FROM public.workshops WHERE id = appointments.workshop_id)
);
-- 2. Clientes pueden crear citas
CREATE POLICY "Clients book appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = client_id);
-- 3. Dueños pueden crear citas (Walk-in)
CREATE POLICY "Owners book appointments" ON public.appointments FOR INSERT WITH CHECK (
  workshop_id IN (SELECT id FROM public.workshops WHERE owner_id = auth.uid())
);
-- 4. Cancelación/Edición
CREATE POLICY "Update appointments" ON public.appointments FOR UPDATE USING (
  auth.uid() = client_id OR -- Cliente cancela
  auth.uid() IN (SELECT owner_id FROM public.workshops WHERE id = appointments.workshop_id) -- Dueño gestiona
);

-- Reseñas: Solo clientes crean reseñas
CREATE POLICY "Clients create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);


-- 5. VISTAS Y FUNCIONES AVANZADAS

-- Vista: Talleres con Promedio de Estrellas
CREATE OR REPLACE VIEW public.workshops_with_rating AS
SELECT 
    w.id,
    w.name,
    w.address,
    w.city,
    w.district,
    w.phone,
    w.location_lat, 
    w.location_lng,
    w.image_url,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating,
    COUNT(r.id) as review_count
FROM public.workshops w
LEFT JOIN public.reviews r ON w.id = r.workshop_id
GROUP BY w.id, w.name, w.address, w.city, w.district, w.phone, w.location_lat, w.location_lng, w.image_url;

-- Función: Buscador Inteligente (Nombre o Servicio)
CREATE OR REPLACE FUNCTION search_workshops(search_term text)
RETURNS SETOF workshops_with_rating
LANGUAGE sql
AS $$
  SELECT DISTINCT w.*
  FROM workshops_with_rating w
  LEFT JOIN services s ON w.id = s.workshop_id
  WHERE
    w.name ILIKE '%' || search_term || '%'
    OR
    s.name ILIKE '%' || search_term || '%';
$$;

-- 6. DATOS DE EJEMPLO (SEED DATA)
-- Ejecutar esto solo si se quiere poblar la BD inicial
/*
INSERT INTO public.workshops (name, district, address, location_lat, location_lng, image_url) VALUES 
  ('MotoFix Los Olivos', 'Los Olivos', 'Av. Carlos Izaguirre 813', -11.9904, -77.0701, null),
  ('Mecánica El Pistón', 'SMP', 'Av. Zarumilla 450', -12.0305, -77.0498, null),
  ('Full Motos Racing', 'Breña', 'Av. Brasil 1200', -12.0621, -77.0465, null);

-- Asignar servicios básicos a los talleres creados
INSERT INTO public.services (workshop_id, name, duration_minutes, price_pe_soles) 
SELECT id, 'Cambio de Aceite', 30, 35.00 FROM public.workshops;

INSERT INTO public.mechanics (workshop_id, name) 
SELECT id, 'Mecánico Principal' FROM public.workshops;
*/