'use client'

import { useState } from "react"
import { Calendar, Clock, User, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cancelAppointment, deleteAppointment, completeAppointment } from "@/app/admin/actions"
import { toast } from "sonner"

// Constants for layout
const START_HOUR = 8
const END_HOUR = 18 // 6 PM
const PIXELS_PER_HOUR = 100
const TOTAL_HOURS = END_HOUR - START_HOUR

export default function AdminCalendar({ appointments = [] }: { appointments: any[] }) {
    // Walk-in Deletion State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [appointmentToDelete, setAppointmentToDelete] = useState<any>(null)

    // Web Cancellation State
    const [isCancelOpen, setIsCancelOpen] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [cancelReason, setCancelReason] = useState("")

    const handleEventClick = (app: any) => {
        if (app.source === 'walk_in') {
            setAppointmentToDelete(app)
            setIsDeleteDialogOpen(true)
        } else {
            setSelectedAppointment(app)
            setCancelReason("")
            setIsCancelOpen(true)
        }
    }

    const handleDelete = async () => {
        if (!appointmentToDelete) return

        const formData = new FormData()
        formData.append("id", appointmentToDelete.id)

        await deleteAppointment(formData)
        setIsDeleteDialogOpen(false)
        setAppointmentToDelete(null)
    }

    const handleCancel = async () => {
        if (!selectedAppointment) return

        const formData = new FormData()
        formData.append("id", selectedAppointment.id)
        if (cancelReason) formData.append("reason", cancelReason)

        await cancelAppointment(formData)
        setIsCancelOpen(false)
        setSelectedAppointment(null)
    }

    const handleComplete = async (appointmentId: string, e: React.MouseEvent) => {
        // CRITICAL: Stop event propagation to prevent opening cancel modal
        e.stopPropagation()

        const result = await completeAppointment(appointmentId)
        if (result.error) {
            toast.error("Error al completar la cita")
        } else {
            toast.success("Cita marcada como completada")
            window.location.reload()
        }
    }

    // Colors based on source
    const getAppointmentStyle = (app: any) => {
        if (app.source === 'walk_in') {
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-500',
                text: 'text-blue-700',
                icon: 'text-blue-600',
                badge: 'bg-blue-500 text-white'
            }
        }
        // Default Web
        return {
            bg: 'bg-green-50',
            border: 'border-green-500',
            text: 'text-green-700',
            icon: 'text-green-600',
            badge: 'bg-green-500 text-white'
        }
    }

    // Helper to calculate position
    const getPosition = (timeStr: string) => {
        if (!timeStr) return 0
        const [hours, minutes] = timeStr.split(':').map(Number)
        const totalHours = hours + minutes / 60
        return (totalHours - START_HOUR) * PIXELS_PER_HOUR
    }

    const getDurationHeight = (startStr: string, endStr: string) => {
        if (!startStr || !endStr) return PIXELS_PER_HOUR
        const [startH, startM] = startStr.split(':').map(Number)
        const [endH, endM] = endStr.split(':').map(Number)
        const durationHours = (endH + endM / 60) - (startH + startM / 60)
        return Math.max(durationHours * PIXELS_PER_HOUR, 40) // Min height
    }

    const hoursArray = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i)

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                {/* Header Row */}
                <div className="grid grid-cols-[80px_1fr] border-b border-slate-100 sticky top-0 bg-white z-10">
                    <div className="p-4 border-r border-slate-100"></div>
                    <div className="p-4 text-sm font-medium text-slate-500">Citas del día</div>
                </div>

                {/* Scrollable Area */}
                <div className="relative" style={{ height: TOTAL_HOURS * PIXELS_PER_HOUR }}>
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

                    {appointments.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none pl-[80px]">
                            No hay citas programadas para hoy
                        </div>
                    )}

                    {appointments.map((app) => {
                        const style = getAppointmentStyle(app)
                        return (
                            <div
                                key={app.id}
                                className={`
                                    absolute left-[90px] right-4 rounded-lg border-l-4 p-3 shadow-sm transition-all hover:shadow-md group relative
                                    ${style.bg} ${style.border}
                                    ${app.status === 'completed' ? 'opacity-60 border-slate-400' : ''}
                                    cursor-pointer
                                `}
                                style={{
                                    top: getPosition(app.start),
                                    height: getDurationHeight(app.start, app.end) - 4,
                                    zIndex: 10
                                }}
                                onClick={() => handleEventClick(app)}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2 text-xs font-medium">
                                        <Clock className={`h-3 w-3 ${style.icon}`} />
                                        <span className={style.text}>
                                            {app.start} - {app.end}
                                        </span>
                                        {/* Complete button - INLINE next to time */}
                                        {app.status !== 'completed' && app.status !== 'cancelled' && (
                                            <button
                                                onClick={(e) => handleComplete(app.id, e)}
                                                className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-green-100 border border-green-300 transition-colors z-20"
                                                title="Marcar como completada"
                                            >
                                                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Status badge */}
                                        {app.status === 'cancelled' ? (
                                            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Cancelado</span>
                                        ) : app.status === 'completed' ? (
                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Completado</span>
                                        ) : (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${style.badge}`}>{app.source === 'walk_in' ? 'Presencial' : 'Web'}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Only show vehicle model if it exists and is not placeholder */}
                                {app.title && app.title !== "Vehículo sin modelo" && (
                                    <h3 className="text-sm font-bold text-slate-800">{app.title}</h3>
                                )}

                                <p className={`text-xs mb-1 ${style.text}`}>
                                    {app.subtitle}
                                </p>
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {app.client_name || app.client || "Cliente"}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Walk-in Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Liberar este horario?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el bloqueo de horario y permitirá nuevas citas.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Liberar Horario
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Web Cancel Modal */}
            <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Cita</DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro que deseas cancelar esta cita? Se notificará al usuario.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-4">
                        <Label>Motivo de cancelación (Opcional)</Label>
                        <Input
                            placeholder="Ej. El mecánico no está disponible..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelOpen(false)}>Volver</Button>
                        <Button variant="destructive" onClick={handleCancel}>Confirmar Cancelación</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
