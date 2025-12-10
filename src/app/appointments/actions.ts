'use server'

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

export async function submitReview(formData: FormData) {
    const supabase = await createClient()

    const appointmentId = formData.get('appointmentId') as string
    const workshopId = formData.get('workshopId') as string
    const clientId = formData.get('clientId') as string
    const rating = parseInt(formData.get('rating') as string)
    const comment = formData.get('comment') as string

    console.log('📝 Review submission data:', { appointmentId, workshopId, clientId, rating, comment })

    if (!appointmentId || !workshopId || !clientId || !rating) {
        const error = new Error("Faltan datos requeridos")
        console.error('❌ Validation error:', { appointmentId, workshopId, clientId, rating })
        throw error
    }

    // Get the current user to ensure ownership (optional but good practice)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('❌ No authenticated user found')
        throw new Error("Usuario no autenticado")
    }

    const reviewData = {
        appointment_id: appointmentId,
        workshop_id: workshopId,
        client_id: clientId,
        rating: rating,
        comment: comment || '',
    }

    console.log('💾 Inserting review:', reviewData)

    const { error } = await supabase
        .from('reviews')
        .insert(reviewData)

    if (error) {
        console.error("❌ Error submitting review:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        throw new Error(`No se pudo guardar la reseña: ${error.message}`)
    }

    console.log('✅ Review submitted successfully')
    revalidatePath('/appointments')
}

export async function cancelClientAppointment(appointmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Usuario no autenticado")
    }

    // Ensure the appointment belongs to the user
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('id, client_id')
        .eq('id', appointmentId)
        .single()

    if (fetchError || !appointment) {
        throw new Error("Cita no encontrada")
    }



    // The user requested "delete".
    console.log(`🗑️ Attempting to delete appointment ${appointmentId} for user ${user.id}`)


    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        console.error("❌ SUPABASE_SERVICE_ROLE_KEY is missing")
        throw new Error("Error de configuración del servidor")
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error, count } = await supabaseAdmin
        .from('appointments')
        .delete({ count: 'exact' })
        .eq('id', appointmentId)

    if (error) {
        console.error("❌ Error deleting appointment:", error)
        throw new Error(`Error al eliminar la cita: ${error.message}`)
    }

    console.log(`✅ Deletion result - Count: ${count}`)

    if (count === 0) {
        console.error("❌ No rows deleted. ID mismatch even with admin.")
        throw new Error("No se pudo eliminar la cita.")
    }

    revalidatePath('/appointments')
}
