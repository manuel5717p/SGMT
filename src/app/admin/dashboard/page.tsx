"use client"

import { useState, useEffect } from "react"
import {
    Calendar as CalendarIcon,
    Wrench,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getDashboardAppointments } from "@/app/auth/actions"
import DashboardActions from "@/components/admin/DashboardActions"
import AdminCalendar from "@/components/admin/AdminCalendar"
import { AdminUserMenu } from "@/components/admin/AdminUserMenu"
import MechanicsManager from "@/components/admin/MechanicsManager"

export default function AdminDashboard() {
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date())

    const loadData = async () => {
        setLoading(true)
        try {
            const dateString = selectedDate.toISOString().split('T')[0] // YYYY-MM-DD
            const { appointments } = await getDashboardAppointments(dateString)
            if (appointments) setAppointments(appointments)
        } catch (err) {
            console.error("Failed to fetch data", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [selectedDate]) // Reload when date changes

    const handlePrevDay = () => {
        const prevDay = new Date(selectedDate)
        prevDay.setDate(prevDay.getDate() - 1)
        setSelectedDate(prevDay)
    }

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate)
        nextDay.setDate(nextDay.getDate() + 1)
        setSelectedDate(nextDay)
    }

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
                        <CalendarIcon className="h-5 w-5" />
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
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handlePrevDay}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium text-slate-700">
                                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleNextDay}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <AdminUserMenu />
                </header>

                {/* Sub Header for Actions */}
                <div className="px-6 py-4 flex items-center justify-between">
                    <MechanicsManager />
                    <DashboardActions selectedDate={selectedDate} />
                </div>

                {/* Timeline - Now using separate component */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-slate-500">Cargando...</p>
                        </div>
                    ) : (
                        <AdminCalendar appointments={appointments} />
                    )}
                </div>
            </main>
        </div>
    )
}
