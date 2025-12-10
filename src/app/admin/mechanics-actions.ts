'use server'

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

// Get mechanics for the current workshop
export async function getMechanics() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { mechanics: [], capacity: 1 }

    const { data: workshop } = await supabase
        .from('workshops')
        .select('id, simultaneous_capacity')
        .eq('owner_id', user.id)
        .single()

    if (!workshop) return { mechanics: [], capacity: 1 }

    const { data: mechanics } = await supabase
        .from('mechanics')
        .select('id, name, is_active')
        .eq('workshop_id', workshop.id)
        .order('created_at', { ascending: true })

    return {
        mechanics: mechanics || [],
        capacity: workshop.simultaneous_capacity || 1
    }
}

// Create a new mechanic
export async function createMechanic(formData: FormData) {
    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
        return { error: "El nombre es requerido" }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) return { error: "No workshop found" }

    const { error } = await supabase
        .from('mechanics')
        .insert({
            workshop_id: workshop.id,
            name: name.trim(),
            is_active: true
        })

    if (error) {
        console.error("Error creating mechanic:", error)
        return { error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}

// Update mechanic name
export async function updateMechanic(formData: FormData) {
    const id = formData.get("id") as string
    const name = formData.get("name") as string

    if (!name || name.trim().length === 0) {
        return { error: "El nombre es requerido" }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No authenticated user" }

    const { data: workshop } = await supabase.from('workshops').select('id').eq('owner_id', user.id).single()
    if (!workshop) return { error: "No workshop found" }

    const { error } = await supabase
        .from('mechanics')
        .update({ name: name.trim() })
        .eq('id', id)
        .eq('workshop_id', workshop.id) // Security: only update own workshop mechanics

    if (error) {
        console.error("Error updating mechanic:", error)
        return { error: error.message }
    }

    revalidatePath('/admin/dashboard')
    return { success: true }
}
