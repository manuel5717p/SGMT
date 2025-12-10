'use server'

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createWorkshop(formData: FormData) {
    const name = formData.get("name") as string
    const city = formData.get("city") as string
    const district = formData.get("district") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const openingTime = formData.get("openingTime") as string
    const closingTime = formData.get("closingTime") as string
    const locationLat = parseFloat(formData.get("location_lat") as string)
    const locationLng = parseFloat(formData.get("location_lng") as string)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "No authenticated user" }
    }

    const { error } = await supabase
        .from('workshops')
        .insert({
            owner_id: user.id,
            name,
            city,
            district,
            address,
            phone,
            opening_time: openingTime,
            closing_time: closingTime,
            location_lat: locationLat,
            location_lng: locationLng
        })

    if (error) {
        console.error("Error creating workshop:", error)
        return { error: error.message }
    }

    redirect('/admin/dashboard')
}

export async function updateWorkshopSettings(formData: FormData) {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const capacity = parseInt(formData.get("capacity") as string)

    const supabase = await createClient()

    const { error } = await supabase
        .from('workshops')
        .update({
            name,
            address,
            phone,
            simultaneous_capacity: capacity
        })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function upsertService(formData: FormData) {
    const supabase = await createClient()

    // 1. Obtener usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Usuario no autenticado" }

    // 2. OBLIGATORIO: Obtener el ID del taller de este usuario
    const { data: workshop } = await supabase
        .from('workshops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!workshop) return { error: "No tienes un taller registrado" }

    // 3. Preparar datos
    const serviceId = formData.get('id') as string | null
    const name = formData.get('name') as string
    const duration = parseInt(formData.get('duration') as string)
    const price = parseFloat(formData.get('price') as string) // El frontend envía 'price'

    const serviceData = {
        name,
        duration_minutes: duration,
        price_pe_soles: price,  // Mapeo correcto a la columna de la BD
        workshop_id: workshop.id // Vincular al taller
    }

    let error

    if (serviceId) {
        // Actualizar
        const { error: updateError } = await supabase
            .from('services')
            .update(serviceData)
            .eq('id', serviceId)
            .eq('workshop_id', workshop.id) // Seguridad extra
        error = updateError
    } else {
        // Crear nuevo
        const { error: insertError } = await supabase
            .from('services')
            .insert(serviceData)
        error = insertError
    }

    if (error) {
        console.error("Error upserting service:", error)
        return { error: error.message }
    }

    // 4. Refrescar la pantalla
    revalidatePath('/admin/services')
    return { success: true }
}

export async function deleteService(formData: FormData) {
    const id = formData.get("id") as string

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }
    revalidatePath('/admin/services')
    return { success: true }
}

export async function createWalkInAppointment(formData: FormData) {
    const clientName = formData.get("clientName") as string
    const serviceId = formData.get("serviceId") as string
    const date = formData.get("date") as string // YYYY-MM-DD
    const time = formData.get("time") as string // HH:MM

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    // Get workshop
    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) return { error: "No workshop found" }

    // FAILL-SAFE LOGIC START
    let finalServiceId = serviceId;
    let duration = 30; // Default fallback duration
    let internalNotes = '';

    // 1. Try to get service by ID
    const { data: serviceById } = await supabase
        .from('services')
        .select('id, duration_minutes, name')
        .eq('id', serviceId)
        .single()

    if (serviceById) {
        finalServiceId = serviceById.id;
        duration = serviceById.duration_minutes;
    } else {
        // 2. Fallback: Try Name Search
        const { data: serviceByName } = await supabase
            .from('services')
            .select('id, duration_minutes, name')
            .eq('workshop_id', workshop.id)
            .ilike('name', `%${serviceId}%`)
            .limit(1)
            .single()

        if (serviceByName) {
            finalServiceId = serviceByName.id;
            duration = serviceByName.duration_minutes;
            internalNotes = `Servicio original '${serviceId}' no encontrado. Asignado por coincidencia de nombre: ${serviceByName.name}.`;
        } else {
            // 3. Fallback: Get ANY service or Default
            const { data: anyService } = await supabase
                .from('services')
                .select('id, duration_minutes, name')
                .eq('workshop_id', workshop.id)
                .limit(1)
                .single()

            if (anyService) {
                finalServiceId = anyService.id;
                duration = anyService.duration_minutes;
                internalNotes = `Servicio original '${serviceId}' no encontrado. Asignado servicio por defecto: ${anyService.name}.`;
            } else {
                return { error: `No se encontraron servicios configurados en el taller. Por favor cree un servicio primero.` }
            }
        }
    }
    // FAIL-SAFE LOGIC END

    // Get a mechanic for the workshop (mechanic_id is required)
    // Prioritize active mechanics
    const { data: mechanic } = await supabase
        .from('mechanics')
        .select('id')
        .eq('workshop_id', workshop.id)
        .eq('is_active', true)
        .limit(1)
        .single()

    if (!mechanic) {
        return { error: "No se encontró un mecánico activo. Configure al menos un mecánico en su taller." }
    }

    // TIMEZONE FIX: Hardcoded Peru timezone (-05:00)
    // Construct timestamp with explicit timezone offset to prevent day shifting
    // date comes as "YYYY-MM-DD", time comes as "HH:MM"
    // Format: YYYY-MM-DDTHH:mm:ss-05:00
    const startTimestamp = `${date}T${time}:00-05:00`

    // Calculate end time by adding duration
    const startDateTime = new Date(startTimestamp)
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000)
    const endTimestamp = endDateTime.toISOString()

    const { error } = await supabase
        .from('appointments')
        .insert({
            workshop_id: workshop.id,
            service_id: finalServiceId,
            mechanic_id: mechanic.id,
            start_time: startTimestamp,
            end_time: endTimestamp,
            status: 'confirmed',
            source: 'walk_in',
            client_name: clientName,
            internal_notes: internalNotes || null
        })

    if (error) {
        console.error("Error creating walk-in:", error)
        return { error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}

// Complete an appointment (mark as finished)
export async function completeAppointment(appointmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    // Get workshop to verify ownership
    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) return { error: "No workshop found" }

    // Update appointment status to completed
    const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId)
        .eq('workshop_id', workshop.id) // Security: only update own appointments

    if (error) {
        console.error("Error completing appointment:", error)
        return { error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}

export async function cancelAppointment(formData: FormData) {
    const id = formData.get("id") as string
    const reason = formData.get("reason") as string

    const supabase = await createClient()

    const { error } = await supabase
        .from('appointments')
        .update({
            status: 'cancelled',
            internal_notes: reason
        })
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/dashboard')
    return { success: true }
}

export async function getWorkshopServices() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) return []

    const { data: services } = await supabase.from('services').select('id, name').eq('workshop_id', workshop.id)
    return services || []
}

export async function getServices() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.log('[getServices] No user found')
        return []
    }

    const { data: workshop, error: workshopError } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) {
        console.log('[getServices] No workshop found for user:', user.id, 'Error:', workshopError)
        return []
    }

    console.log('[getServices] Workshop ID:', workshop.id)

    // Fetch services with explicit column mapping
    const { data: rawServices, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('workshop_id', workshop.id)
        .order('name', { ascending: true })

    // Map price_pe_soles to price for frontend compatibility
    const services = rawServices?.map(svc => ({
        id: svc.id,
        workshop_id: svc.workshop_id,
        name: svc.name,
        duration_minutes: svc.duration_minutes,
        price: svc.price_pe_soles,
        created_at: svc.created_at
    }))

    console.log('[getServices] Services fetched:', services?.length || 0, 'Error:', servicesError)
    if (services && services.length > 0) {
        console.log('[getServices] First service:', services[0])
    }

    return services || []
}

export async function deleteAppointment(formData: FormData) {
    const id = formData.get("id") as string

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Error deleting appointment:", error)
        return { error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}
