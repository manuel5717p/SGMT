'use client'

import { useState } from "react"
import { Calendar, Clock, MapPin, Wrench, Star } from "lucide-react"
import { ReviewModal } from "./ReviewModal"
import Link from "next/link"
import { cancelClientAppointment } from "../actions"
import { toast } from "sonner"

interface AppointmentCardProps {
    appointment: any // Using any for flexibility based on the Supabase join structure
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [isCancelling, setIsCancelling] = useState(false)

    const workshop = Array.isArray(appointment.workshop) ? appointment.workshop[0] : appointment.workshop
    const service = Array.isArray(appointment.service) ? appointment.service[0] : appointment.service
    const review = Array.isArray(appointment.reviews) ? appointment.reviews[0] : appointment.reviews

    const startDate = new Date(appointment.start_time)
    const dateStr = startDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    // Border color logic - TOP BORDER (border-t-4)
    const getBorderClass = (status: string) => {
        switch (status) {
            case 'completed': return 'border-t-4 border-t-green-500'
            case 'confirmed': return 'border-t-4 border-t-green-500'
            case 'cancelled': return 'border-t-4 border-t-red-500'
            default: return 'border-t-4 border-t-gray-200'
        }
    }

    // Status badge styling
    const getStatusBadge = (status: string) => {
        if (status === 'confirmed') {
            return (
                <div className="bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase">
                    Confirmada
                </div>
            )
        }
        if (status === 'completed') {
            return (
                <div className="bg-green-100 text-green-700 text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Servicio Completado
                </div>
            )
        }
        if (status === 'cancelled') {
            return (
                <div className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase">
                    Cancelada
                </div>
            )
        }
        return null
    }

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

    const handleCancel = async () => {
        if (appointment.status !== 'confirmed') return

        try {
            setIsCancelling(true)
            await cancelClientAppointment(appointment.id)
            setIsDeleted(true)
            toast.success("Cita cancelada exitosamente")
        } catch (error) {
            console.error(error)
            toast.error("Error al cancelar la cita")
        } finally {
            setIsCancelling(false)
        }
    }

    if (isDeleted) return null

    return (
        <>
            <div className={`bg-white rounded-lg shadow-md ${getBorderClass(appointment.status)} overflow-hidden`}>
                {/* Card content padding */}
                <div className="p-5">
                    {/* Row 1: Header - Workshop Name, Address & Status Badge */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3 flex-1">
                            <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 leading-tight">
                                    {workshop?.name}
                                </h3>
                                <p className="text-slate-500 text-sm mt-0.5">
                                    {workshop?.address}
                                </p>
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            {getStatusBadge(appointment.status)}
                        </div>
                    </div>

                    {/* Row 2: Date & Time Blocks */}
                    <div className="flex gap-3 mb-4">
                        <div className="bg-blue-50 rounded-lg px-3 py-2.5 flex items-center gap-3 flex-1">
                            <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                                    Fecha
                                </p>
                                <p className="text-sm font-medium text-slate-900 capitalize">
                                    {dateStr}
                                </p>
                            </div>
                        </div>
                        <div className="bg-orange-50 rounded-lg px-3 py-2.5 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                                    Hora
                                </p>
                                <p className="text-sm font-medium text-slate-900">
                                    {timeStr}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Service & Price */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-slate-600" />
                            <span className="font-bold text-slate-900">
                                {service?.name || "Servicio General"}
                            </span>
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                            S/ {service?.price_pe_soles || 0}
                        </div>
                    </div>

                    {/* Row 4: Vehicle */}
                    <div className="mb-4">
                        <p className="text-slate-600 text-sm">
                            Vehículo: {appointment.vehicle_model}
                        </p>
                    </div>

                    {/* Row 5: Footer Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        {/* Left side: Action links */}
                        <div className="flex gap-4 items-center">
                            {appointment.status === 'confirmed' && (
                                <>
                                    <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
                                        Ver detalles
                                    </Link>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isCancelling}
                                        className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                                    >
                                        {isCancelling ? "Cancelando..." : "Cancelar"}
                                    </button>
                                </>
                            )}
                            {appointment.status === 'cancelled' && (
                                <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
                                    Ver motivo de cancelación
                                </Link>
                            )}
                        </div>

                        {/* Right side: Review action for completed appointments */}
                        {appointment.status === 'completed' && (
                            <div>
                                {review ? (
                                    <div className="flex gap-0.5" title="Ya calificaste este servicio">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-5 h-5 ${star <= review.rating
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "fill-gray-200 text-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsReviewOpen(true)}
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        Calificar servicio
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                appointmentId={appointment.id}
                workshopId={workshop?.id}
                workshopName={workshop?.name}
                clientId={appointment.client_id}
            />
        </>
    )
}
