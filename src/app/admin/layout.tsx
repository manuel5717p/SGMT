import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { headers } from "next/headers"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check if user has a workshop
    const { data: workshop } = await supabase
        .from('workshops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    const headersList = await headers()
    const pathname = headersList.get("x-invoke-path") || ""

    // If no workshop and NOT on new-workshop page, redirect to onboarding
    if (!workshop && !pathname.includes('/admin/new-workshop')) {
        redirect('/admin/new-workshop')
    }

    // If workshop exists and ON new-workshop page, redirect to dashboard
    if (workshop && pathname.includes('/admin/new-workshop')) {
        redirect('/admin/dashboard')
    }

    return (
        <>
            {children}
        </>
    )
}
