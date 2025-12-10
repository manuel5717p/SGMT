import {
    Calendar,
    Wrench,
    Settings,
} from "lucide-react"
import Link from "next/link"
import ServicesList from "@/components/admin/ServicesList"
import { getServices } from "@/app/admin/actions"
import { AdminUserMenu } from "@/components/admin/AdminUserMenu"

export default async function ServicesPage() {
    console.log('[ServicesPage] Page loading - calling getServices...')
    const services = await getServices()
    console.log('[ServicesPage] getServices returned:', services)
    console.log('[ServicesPage] services.length:', services?.length || 0)

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
                        className="flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg font-medium"
                    >
                        <Wrench className="h-5 w-5" />
                        Servicios
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        Configuración
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-slate-700">Servicios</h2>
                        <AdminUserMenu />
                    </div>
                </header>

                <div className="p-6">
                    <ServicesList initialServices={services} />
                </div>
            </main>
        </div>
    )
}
