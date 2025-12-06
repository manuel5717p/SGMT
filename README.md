# Plataforma SaaS para Talleres de Motos

Esta es una aplicación SaaS integral para descubrir y reservar servicios en talleres de motocicletas, construida con Next.js 15, Supabase y Tailwind CSS.

## Características

### 🔍 Búsqueda y Descubrimiento (`/search`)
- **Diseño de Vista Dual**: Interfaz de pantalla dividida con un mapa dinámico y una lista de talleres.
- **Mapa Interactivo**: Impulsado por **Leaflet**, con marcadores personalizados, animaciones de zoom suaves (`FlyTo`) y seguimiento de ubicación del usuario.
- **Filtrado Avanzado**: Filtra talleres por nombre de servicio, tipo de problema o ubicación.
- **Servicios de Ubicación**:
    - **Geolocalización**: Detecta automáticamente la posición del usuario para cálculos de distancia.
    - **Búsqueda de Direcciones**: Integración con **Nominatim API** (OpenStreetMap) para buscar distritos o direcciones específicas en Perú.

### 📅 Sistema de Reservas (`/book/[id]`)
- **Páginas Dinámicas de Talleres**: Obtiene detalles del taller, imágenes y horarios de atención en tiempo real desde Supabase.
- **Selección de Servicios**: Menú dinámico de servicios con precios que actualizan el total de la reserva al instante.
- **Programación de Citas**: Calendario interactivo y selector de horarios (valida tiempos pasados y disponibilidad).
- **Flujo Simplificado**: Proceso simple de 3 pasos: Seleccionar Servicio -> Seleccionar Fecha/Hora -> Confirmar.
- **Gestión de Vehículos**: Registra el modelo del vehículo para cada cita.

### 👤 Panel de Usuario (`/appointments`)
- **Mis Citas**: Ver el estado de las reservas próximas y pasadas.
- **Estado en Tiempo Real**: Indicadores (badges) para el estado de la cita (Confirmada, Pendiente, etc.).

## Tecnologías (Tech Stack)

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Mapas:** React Leaflet & Leaflet (OSM tiles)
- **Geocodificación:** Nominatim API
- **Arquitectura UI:** componentes shadcn-ui
- **Iconos:** lucide-react
- **Backend/Auth:** Supabase (PostgreSQL)

## Estructura del Proyecto

- `src/app`: Rutas de la aplicación (`search`, `book`, `appointments`, `auth`).
- `src/components/ui`: Componentes de UI reutilizables.
- `src/components/shared`: Componentes específicos de funcionalidades (`WorkshopMap`, `FilterBar`, `WorkshopBookingClient`).
- `src/lib`: Configuración de Supabase y utilidades.
- `src/hooks`: Hooks personalizados (ej. `useLocation` para gestión de geolocalización).

## Comenzando (Getting Started)

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configuración de Entorno:**
   Crea un archivo `.env.local` con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-url-del-proyecto
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. **Ejecutar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

4. **Explorar:**
   - Ve a `/search` para buscar talleres.
   - Haz clic en "Reservar" para probar el flujo de reserva.
   - Revisa `/appointments` para ver tus citas.
