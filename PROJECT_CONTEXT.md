# Project Context & Global Rules

## Negocio
App Web para reservas de citas en talleres de motos en Perú.

## Roles
- **Motero (Cliente)**
- **Taller (Admin)**

## Diseño
**Mobile-first siempre.**

### Estética Visual
- **Vibe:** Limpio, Confiable, Accesible (Friendly). Prioridad a la legibilidad.

### Paleta de Colores (Strict Match)
- **Primary Color:** Green (`#4CAF50` o Tailwind `green-600`). Usado para:
  - Botones de acción principal (CTA)
  - Estados seleccionados
  - Precios
- **Background:** Gris muy claro (`slate-50` o `#F9FAFB`).
- **Surface/Cards:** Blanco puro (`#FFFFFF`) con sombras suaves (`shadow-sm`).
- **Text:**
  - Títulos: Gris oscuro (`slate-900`)
  - Detalles secundarios: Gris medio (`slate-500`)

### Componentes UI
- **Bordes:** Redondeados suaves (`rounded-lg` o `rounded-xl`).
- **Botones:** Full Width (ancho completo) en móvil, texto blanco, fondo verde.
- **Iconos:** Estilo "Outline" (línea fina), usando `lucide-react`.

## Base de Datos
- **Provider:** Supabase.
- **Fechas:** Siempre en UTC en backend. Transformar a 'America/Lima' en el frontend.

## Stack
- **Framework:** Next.js 15 (App Router).
- **Backend:** Server Actions (evitar API Routes si es posible).
- **Restricciones:** No usar directorio `pages/`.
