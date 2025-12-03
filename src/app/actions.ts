'use server'

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { toZonedTime, format } from 'date-fns-tz'

export async function getBusySlots(workshopId: string, dateStr: string) {
    const supabase = await createClient()

    // Define range for the whole day in UTC (simplified)
    // Ideally we should query based on the workshop's timezone day boundaries
    // For now, let's query a broad range around the target date to be safe
    // or just filter in memory if the dataset is small per workshop/day.
    // Better: Query by date string if we stored it, but we store timestamptz.

    // Let's assume dateStr is "YYYY-MM-DD"
    // We want appointments that overlap with this day in America/Lima

    const timeZone = 'America/Lima'

    // Start of day in Lima
    // We need to construct the query carefully. 
    // Simplest approach for MVP: Fetch all appointments for the workshop and filter in JS? 
    // No, that's bad for scale.
    // Fetch appointments where start_time is within the day.

    // Since we don't have easy "day" filtering on timestamptz without some PG functions or range construction:
    // Let's construct the range in JS.

    const startOfDay = new Date(`${dateStr}T00:00:00`)
    const endOfDay = new Date(`${dateStr}T23:59:59`)

    // Adjust these "local" times to UTC for the query? 
    // Wait, `dateStr` is local. 
    // If I say "2024-05-20", I mean 2024-05-20 in Lima.
    // So 2024-05-20 00:00:00 Lima is ... UTC.

    // Using date-fns-tz to get the UTC range for the Lima day
    // Actually, let's just use a simple string match on the date part if possible? 
    // No, timestamptz is stored as absolute time.

    // Let's just fetch a bit wider range and filter.
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select('start_time')
        .eq('workshop_id', workshopId)
        .gte('start_time', `${dateStr}T00:00:00-05:00`) // Approximation of start of day in Lima
        .lte('start_time', `${dateStr}T23:59:59-05:00`) // Approximation of end of day in Lima

    if (error) {
        console.error("Error fetching busy slots:", error)
        return []
    }

    // Convert to local time strings "HH:mm"
    const busySlots = appointments.map(app => {
        const utcDate = new Date(app.start_time)
        const zonedDate = toZonedTime(utcDate, timeZone)
        return format(zonedDate, 'HH:mm', { timeZone })
    })

    return busySlots
}

export async function createReservation(formData: FormData) {
    const workshopId = formData.get('workshopId')
    const serviceId = formData.get('serviceId')
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const duration = parseInt(formData.get('duration') as string)
    const vehicleModel = formData.get('vehicleModel') as string
    const notes = formData.get('notes') as string | null

    if (!workshopId || !serviceId || !date || !time || !duration || !vehicleModel) {
        throw new Error("Faltan datos para la reserva")
    }

    // Calculate start_time and end_time
    // Assuming date is in "YYYY-MM-DD" format and time is "HH:mm"
    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + duration * 60000)

    // Convert to ISO strings for Supabase (timestamptz)
    const startTimeISO = startTime.toISOString()
    const endTimeISO = endTime.toISOString()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Debes iniciar sesión para reservar")
    }

    // Fetch a mechanic for this workshop (MVP: just pick the first active one)
    const { data: mechanic, error: mechanicError } = await supabase
        .from('mechanics')
        .select('id')
        .eq('workshop_id', workshopId)
        .eq('is_active', true)
        .limit(1)
        .single()

    if (mechanicError || !mechanic) {
        throw new Error("No hay mecánicos disponibles en este taller")
    }

    // Check availability
    const { count } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('workshop_id', workshopId)
        .eq('start_time', startTimeISO)

    if (count && count > 0) {
        throw new Error("Este horario ya está reservado. Por favor elige otro.")
    }

    const { error } = await supabase
        .from('appointments')
        .insert({
            workshop_id: workshopId,
            service_id: serviceId,
            mechanic_id: mechanic.id, // Required by new schema
            client_id: user.id,
            start_time: startTimeISO,
            end_time: endTimeISO,
            status: 'confirmed',
            vehicle_model: vehicleModel,
            internal_notes: notes,
            source: 'web'
        })

    if (error) {
        console.error("Error creating reservation:", error)
        throw new Error("Error al crear la reserva")
    }

    // Redirect to success page or refresh
    redirect('/appointments?reservation=success')
}
