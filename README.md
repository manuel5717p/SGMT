# Plataforma SaaS para Talleres de Motos - MOTOFIX

Esta es una aplicación SaaS integral para conectar motociclistas con talleres mecánicos de confianza. Permite a los usuarios encontrar servicios, agendar citas y gestionar el mantenimiento de su vehículo, y a los talleres administrar su negocio de manera digital.

Construida con **Next.js 15**, **Supabase** y **Tailwind CSS**.

## Características Principales

### 🏠 Landing Page & Roles
- **Selección de Rol**: Portal de inicio intuitivo para ingresar como "Mi Vehículo" (Usuario) o "Mi Taller" (Administrador).
- **Diseño Responsivo**: Interfaz moderna y adaptada a dispositivos móviles.

### 🔍 Búsqueda y Descubrimiento (`/search`)
- **Diseño de Vista Dual**: Mapa interactivo y lista de talleres en pantalla dividida.
- **Geolocalización**: Detección automática de ubicación y cálculo de distancias.
- **Filtrado Expresivo**: Búsqueda por servicio (ej. "Cambio de Aceite"), tipo de problema o ubicación.
- **Mapas**: Integración con Leaflet y OpenStreetMap.

### 📅 Reservas & Usuarios (`/appointments`)
- **Agendamiento Inteligente**: Selección de fecha y hora con validación de disponibilidad.
- **Gestión de Citas**: Panel para ver citas próximas, pasadas y canceladas.
- **Sistema de Reseñas**: Los usuarios pueden calificar y dejar comentarios sobre el servicio recibido una vez finalizada la cita.
- **Perfil de Usuario**: Gestión de sesión segura.

### 🛠️ Panel de Administración (`/admin`)
Herramientas completas para dueños de talleres:
- **Dashboard**: Vista general de la actividad del negocio.
- **Gestión de Citas**:
    - **Calendario**: Visualización visual de horarios ocupados.
    - **Listado**: Tabla detallada con estado (Confirmado, Completado, Cancelado).
    - **Walk-in**: Registro de citas presenciales (clientes sin app).
- **Servicios**: ABM (Alta, Baja, Modificación) de catálogo de servicios con precios y duraciones.
- **Perfil del Taller**: Configuración de información pública del negocio.

## Tecnologías (Tech Stack)

- **Frontend:** Next.js 15 (App Router), React 19
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4, shadcn/ui
- **Mapas:** React Leaflet & Leaflet, Nominatim API
- **Iconos:** lucide-react
- **Notificaciones:** sonner (Toasts)
- **Backend & Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth

## Estructura del Proyecto

- `src/app`
    - `(public)`: Rutas públicas (`search`, `book`).
    - `admin`: Panel de control protegido para talleres (`dashboard`, `services`, `appointments`).
    - `auth`: Rutas de autenticación.
    - `appointments`: Panel de usuario final.
- `src/components`
    - `ui`: Componentes base (shadcn/ui).
    - `shared`: Componentes reutilizables de negocio (`AppointmentCard`, `ServicesList`).
- `src/lib`: Clientes de Supabase y utilidades (fecha, formato moneda).
- `src/actions`: Server Actions para mutaciones de datos.

## Comenzando (Getting Started)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de Entorno:**
   Crea un archivo `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. **Ejecutar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

4. **Demo:**
   - **Usuario**: Ve a `/search`, busca un taller y agenda una cita.
   - **Admin**: Ingresa a `/admin/dashboard` para gestionar tu taller.
