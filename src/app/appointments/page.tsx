import { ClientNavbar } from "@/components/shared/ClientNavbar"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Calendar } from "lucide-react"
import { AppointmentCard } from "./components/AppointmentCard"

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            *,
            reviews(*),
            workshop:workshops(id, name, address, image_url),
            service:services(name, price_pe_soles)
        `)
        .eq('client_id', user.id)
        .order('start_time', { ascending: false })

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <ClientNavbar />
            <div className="flex-1 container mx-auto max-w-3xl p-4 space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Mis Citas</h1>

                <div className="space-y-4">
                    {appointments?.map((app) => (
                        <AppointmentCard key={app.id} appointment={app} />
                    ))}

                    {(!appointments || appointments.length === 0) && (
                        <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900">No tienes citas programadas</h3>
                            <p className="text-slate-500 mt-1 mb-6">Busca un taller y reserva tu primera cita.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
