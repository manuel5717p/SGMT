"use client"

import { useState, useEffect } from "react"
import {
    Calendar,
    Wrench,
    Settings,
    Plus,
    ChevronLeft,
    ChevronRight,
    Clock,
    Share2,
    Scan
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDashboardAppointments } from "@/app/auth/actions"

// Constants for layout
const START_HOUR = 8
const END_HOUR = 18 // 6 PM
const PIXELS_PER_HOUR = 100
const TOTAL_HOURS = END_HOUR - START_HOUR

export default function AdminDashboard() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const { appointments, error } = await getDashboardAppointments()
                if (appointments) {
                    setAppointments(appointments)
                }
            } catch (err) {
                console.error("Failed to fetch appointments", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Helper to calculate position
    const getPosition = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        const totalHours = hours + minutes / 60
        return (totalHours - START_HOUR) * PIXELS_PER_HOUR
    }

    const getDurationHeight = (startStr: string, endStr: string) => {
        const [startH, startM] = startStr.split(':').map(Number)
        const [endH, endM] = endStr.split(':').map(Number)
        const durationHours = (endH + endM / 60) - (startH + startM / 60)
        return durationHours * PIXELS_PER_HOUR
    }

    const hoursArray = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)

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
                        className="flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg font-medium"
                    >
                        <Calendar className="h-5 w-5" />
                        Calendario
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        <Wrench className="h-5 w-5" />
                        Servicios
                    </Link>
                    <Link
                        href="#"
                        className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                    >
                        <Settings className="h-5 w-5" />
                        Configuración
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium text-slate-700">Agenda</h2>
                        <div className="flex items-center gap-2 text-slate-500">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium text-slate-700">
                                {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="text-slate-500">
                            <Scan className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="text-slate-600 bg-indigo-600 text-white hover:bg-indigo-700 border-none">
                            Compartir
                        </Button>
                    </div>
                </header>

                {/* Sub Header for Actions */}
                <div className="px-6 py-4 flex justify-end">
                    <Button className="bg-green-500 hover:bg-green-600 text-white gap-2 shadow-sm">
                        <Plus className="h-4 w-4" />
                        Nueva Acción
                    </Button>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                        {/* Header Row */}
                        <div className="grid grid-cols-[80px_1fr] border-b border-slate-100 sticky top-0 bg-white z-10">
                            <div className="p-4 border-r border-slate-100"></div>
                            <div className="p-4 text-sm font-medium text-slate-500">Citas del día</div>
                        </div>

                        {/* Scrollable Area */}
                        <div className="relative" style={{ height: TOTAL_HOURS * PIXELS_PER_HOUR }}>
                            {/* Grid Lines */}
                            {hoursArray.map((hour) => (
                                <div
                                    key={hour}
                                    className="absolute w-full border-b border-slate-50 flex"
                                    style={{ top: (hour - START_HOUR) * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}
                                >
                                    <div className="w-[80px] p-2 text-right text-sm text-slate-400 font-medium border-r border-slate-100 pr-4">
                                        {hour}:00
                                    </div>
                                    <div className="flex-1"></div>
                                </div>
                            ))}

                            {/* Appointments */}
                            {!loading && appointments.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none pl-[80px]">
                                    No hay citas programadas para hoy
                                </div>
                            )}

                            {appointments.map((app) => (
                                <div
                                    key={app.id}
                                    className={`
                                        absolute left-[90px] right-4 rounded-lg border-l-4 p-3 shadow-sm transition-all hover:shadow-md
                                        ${app.type === 'web'
                                            ? 'bg-green-50 border-green-500'
                                            : 'bg-slate-100 border-slate-400'
                                        }
                                    `}
                                    style={{
                                        top: getPosition(app.start),
                                        height: getDurationHeight(app.start, app.end) - 4, // -4 for margin
                                        zIndex: 10
                                    }}
                                >
                                    <div className="flex items-center gap-2 text-xs font-medium mb-1">
                                        <Clock className={`h-3 w-3 ${app.type === 'web' ? 'text-green-600' : 'text-slate-500'}`} />
                                        <span className={app.type === 'web' ? 'text-green-700' : 'text-slate-600'}>
                                            {app.start} - {app.end}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-800">{app.title}</h3>
                                    <p className={`text-xs mb-1 ${app.type === 'web' ? 'text-green-600' : 'text-slate-500'}`}>
                                        {app.subtitle}
                                    </p>
                                    <span
                                        className={`
                                            inline-block px-2 py-0.5 rounded-full text-[10px] font-medium
                                            ${app.type === 'web'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-400 text-white'
                                            }
                                        `}
                                    >
                                        {app.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
