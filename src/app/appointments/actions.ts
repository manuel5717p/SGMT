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
