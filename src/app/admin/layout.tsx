import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { WorkshopGuard } from "@/components/auth/WorkshopGuard"

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

    return (
        <WorkshopGuard hasWorkshop={!!workshop}>
            {children}
        </WorkshopGuard>
    )
}
