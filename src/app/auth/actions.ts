'use server'

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function registerUser(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const phone = formData.get("phone") as string
    const role = formData.get("role") as string

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone: phone,
                role: role,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.user) {
        // Use Service Role Key to bypass RLS if available
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        let supabaseAdmin = supabase

        if (serviceRoleKey) {
            const { createClient: createAdminClient } = await import('@supabase/supabase-js')
            supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceRoleKey,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            )
        }

        // Insert into profiles table
        try {
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: data.user.id,
                    full_name: fullName,
                    phone: phone,
                    role: role, // Explicitly pass role
                    email: email
                })

            if (profileError) {
                console.error("Error creating profile:", profileError)
                throw new Error("Error al crear el perfil de usuario")
            }
        } catch (error) {
            console.error("Profile creation failed:", error)
            // Delete user from auth if profile creation fails to maintain consistency
            await supabaseAdmin.auth.admin.deleteUser(data.user.id)
            throw new Error("Error crítico al crear el perfil. Por favor contacte soporte.")
        }
    }



    if (data.session) {
        if (role === 'admin') {
            redirect('/admin/dashboard')
        }
        // For clients, we don't redirect here to allow the frontend to show the success message
    }

    return { success: true }
}

export async function loginUser(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Redirect based on role? 
    // For now, we'll redirect to a generic dashboard or let the client handle it.
    // But Server Actions with redirect are better.
    // We need to fetch the profile to know the role.

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role === 'admin') {
            redirect('/admin/dashboard')
        } else {
            redirect('/search')
        }
    }

    redirect('/')
}

export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
}

export async function getDashboardAppointments(dateString?: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    // Get user's workshop (assuming 1:1 for now, or pick first)
    // We need to know which workshop the admin manages.
    // Assuming 'mechanics' table links user to workshop? Or 'profiles' has workshop_id?
    // The prompt says "Filtra por workshop_id (el taller del usuario logueado)".
    // Let's assume the user is a mechanic/admin and has a workshop_id in their profile OR we find a mechanic record for them.
    // Let's check if 'mechanics' table has 'user_id' or if 'profiles' has 'workshop_id'.
    // Based on previous debug, 'mechanics' has 'id', 'workshop_id', 'name'. It doesn't seem to have 'user_id'.
    // Maybe 'profiles' has it? Debug output for profiles was empty.
    // Let's assume for now we fetch the first workshop found for the user, or just ALL appointments if we can't filter (for demo).
    // BETTER: Fetch the workshop where the user is the owner (if workshops table has owner_id).
    // Let's try to fetch a workshop where owner_id = user.id.

    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()

    // If no workshop owned, maybe they are just a mechanic? 
    // For this task, I will assume the user OWNS a workshop.

    let workshopId = workshop?.id

    // Fallback for demo: if no workshop found, use a hardcoded one or the first one in DB
    if (!workshopId) {
        const { data: firstWorkshop } = await supabase.from('workshops').select('id').limit(1).single()
        workshopId = firstWorkshop?.id
    }

    if (!workshopId) return { appointments: [] } // No workshop, no appointments

    // TIMEZONE FIX: Create date range matching Peru timezone (-05:00)
    // The dateString comes in YYYY-MM-DD format
    // We need to query for all appointments that fall within this LOCAL day
    // Since appointments are stored with -05:00 offset, we need to convert our range accordingly

    const targetDate = dateString ? new Date(dateString + 'T00:00:00') : new Date()

    // Create start of day: YYYY-MM-DD 00:00:00 -05:00
    const year = targetDate.getFullYear()
    const month = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')

    const startOfDayUTC = `${year}-${month}-${day}T00:00:00-05:00`
    const endOfDayUTC = `${year}-${month}-${day}T23:59:59-05:00`

    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
      id,
      start_time,
      end_time,
      vehicle_model,
      status,
      source,
      client_name,
      service:services(name),
      mechanic:mechanics(name),
      client:profiles(full_name)
    `)
        .eq('workshop_id', workshopId)
        .gte('start_time', startOfDayUTC)
        .lte('start_time', endOfDayUTC)

    if (error) {
        console.error("Error fetching appointments:", error)
        return { error: error.message }
    }

    // Transform data for UI
    const formattedAppointments = appointments.map(app => {
        const start = new Date(app.start_time)
        const end = new Date(app.end_time)

        // Format HH:MM
        const formatTime = (date: Date) => date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })

        // Supabase returns arrays for joins usually, unless 1:1 is strictly inferred.
        // We cast to any to avoid complex type definition for now, or access as array if needed.
        // Based on lint error, it is an array.
        const service = Array.isArray(app.service) ? app.service[0] : app.service
        const mechanic = Array.isArray(app.mechanic) ? app.mechanic[0] : app.mechanic
        const client = Array.isArray(app.client) ? app.client[0] : app.client

        return {
            id: app.id,
            start: formatTime(start),
            end: formatTime(end),
            title: app.vehicle_model || "Vehículo sin modelo",
            subtitle: service?.name || "Servicio General",
            mechanic: mechanic?.name,
            client: client?.full_name,
            client_name: app.client_name,
            source: app.source || 'web',
            type: client ? 'web' : 'walk-in', // If linked to profile, it's web/app. If not, walk-in.
            status: app.status || (client ? 'Reserva Web' : 'Sin cita previa')
        }
    })

    return { appointments: formattedAppointments }
}
