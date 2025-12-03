import { ClientNavbar } from "@/components/shared/ClientNavbar"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Calendar, Clock, MapPin, Store } from "lucide-react"

export default async function AppointmentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    const { data: appointments } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            end_time,
            status,
            vehicle_model,
            service:services(name, price_pe_soles),
            workshop:workshops(name, address)
        `)
        .eq('client_id', user.id)
        .order('start_time', { ascending: false })

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <ClientNavbar />
            <div className="flex-1 container mx-auto max-w-3xl p-4 space-y-6">
                <h1 className="text-2xl font-bold text-slate-900">Mis Citas</h1>

                <div className="space-y-4">
                    {appointments?.map((app) => {
                        const startDate = new Date(app.start_time)
                        const dateStr = startDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                        const timeStr = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

                        // Handle joined data which might be arrays or objects depending on Supabase client types
                        const workshop = Array.isArray(app.workshop) ? app.workshop[0] : app.workshop
                        const service = Array.isArray(app.service) ? app.service[0] : app.service

                        return (
                            <div key={app.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{workshop?.name}</h3>
                                        <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>{workshop?.address}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {app.status === 'confirmed' ? 'Confirmada' : app.status}
                                    </span>
                                </div>

                                <div className="border-t border-slate-50 pt-4 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Fecha</p>
                                            <p className="text-sm font-medium capitalize">{dateStr}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Hora</p>
                                            <p className="text-sm font-medium">{timeStr}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-slate-400" />
                                        <span className="text-slate-700">{service?.name || "Servicio General"}</span>
                                    </div>
                                    <span className="font-semibold text-slate-900">S/ {service?.price_pe_soles || 0}</span>
                                </div>

                                <div className="text-xs text-slate-400">
                                    Vehículo: {app.vehicle_model}
                                </div>
                            </div>
                        )
                    })}

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
