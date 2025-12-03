import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { SettingsForm } from "./SettingsForm"

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: workshop } = await supabase
        .from('workshops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!workshop) redirect('/admin/new-workshop')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Configuración del Taller</h1>
                <p className="text-slate-500">Gestiona tu plan y configuración de atención</p>
            </div>

            <SettingsForm workshop={workshop} />
        </div>
    )
}
