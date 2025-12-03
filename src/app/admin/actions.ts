'use server'

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createWorkshop(formData: FormData) {
    const name = formData.get("name") as string
    const district = formData.get("district") as string
    const address = formData.get("address") as string
    const openingTime = formData.get("openingTime") as string
    const closingTime = formData.get("closingTime") as string

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
            district,
            address,
            opening_time: openingTime,
            closing_time: closingTime
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
    const id = formData.get("id") as string | null
    const name = formData.get("name") as string
    const duration = parseInt(formData.get("duration") as string)
    const price = parseFloat(formData.get("price") as string)

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    // Get workshop id
    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) return { error: "No workshop found" }

    let error
    if (id) {
        // Update
        const result = await supabase
            .from('services')
            .update({ name, duration_minutes: duration, price })
            .eq('id', id)
            .eq('workshop_id', workshop.id)
        error = result.error
    } else {
        // Create
        const result = await supabase
            .from('services')
            .insert({
                workshop_id: workshop.id,
                name,
                duration_minutes: duration,
                price
            })
        error = result.error
    }

    if (error) {
        console.error("Error upserting service:", error)
        return { error: error.message }
    }

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
