import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { SettingsForm } from "./SettingsForm"
import {
    Calendar,
    Wrench,
    Settings as SettingsIcon,
} from "lucide-react"
import Link from "next/link"
import { AdminUserMenu } from "@/components/admin/AdminUserMenu"

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
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-slate-800">Gestión Taller</h1>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        <Calendar className="h-5 w-5" />
                        Calendario
                    </Link>
                    <Link
                        href="/admin/services"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        <Wrench className="h-5 w-5" />
                        Servicios
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg font-medium"
                    >
                        <SettingsIcon className="h-5 w-5" />
                        Configuración
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <SettingsIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Configuración del Taller</h2>
                                <p className="text-sm text-slate-500">Gestiona tu plan y configuración de atención</p>
                            </div>
                        </div>
                        <AdminUserMenu />
                    </div>
                </header>

                <div className="p-6">
                    <SettingsForm workshop={workshop} />
                </div>
            </main>
        </div>
    )
}
