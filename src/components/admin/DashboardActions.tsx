'use client'

import { useState, useEffect } from "react"
import { Plus, User, Clock, Loader2 } from "lucide-react"
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createWalkInAppointment, getWorkshopServices } from "@/app/admin/actions"
import { toast } from "sonner"

interface DashboardActionsProps {
    selectedDate: Date
}

export default function DashboardActions({ selectedDate }: DashboardActionsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingServices, setLoadingServices] = useState(false)
    const [services, setServices] = useState<any[]>([])

    const [clientName, setClientName] = useState("")
    const [startTime, setStartTime] = useState("")
    const [serviceId, setServiceId] = useState("")

    // TIMEZONE FIX: Extract date components using LOCAL getters, NOT toISOString()
    // toISOString() converts to UTC first, which shifts the date in GMT-5
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}` // YYYY-MM-DD in LOCAL timezone

    useEffect(() => {
        if (isOpen) {
            setLoadingServices(true)
            getWorkshopServices()
                .then(data => {
                    setServices(data)
                })
                .catch(err => console.error("Error loading services", err))
                .finally(() => setLoadingServices(false))
        }
    }, [isOpen])

    async function handleSave() {
        if (!clientName || !startTime || !serviceId) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("clientName", clientName)
            formData.append("date", formattedDate) // Use selected calendar date
            formData.append("time", startTime)
            formData.append("serviceId", serviceId)

            const result = await createWalkInAppointment(formData)
            if (result.error) throw new Error(result.error)

            // Success - close modal and reset
            setIsOpen(false)
            setClientName("")
            setStartTime("")
            setServiceId("")

            // Show success toast
            toast.success("Cita registrada exitosamente")

            // Refresh the page to show the new appointment in calendar
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast.error(`Error al crear la cita: ${error instanceof Error ? error.message : "Error desconocido"}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Acción
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Registrar Cita Presencial</DialogTitle>
                        <DialogDescription>
                            Crea una cita rápida para ocupar el horario inmediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre del Cliente</Label>
                            <Input
                                id="name"
                                placeholder="Ej. Juan Pérez"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="time">Hora de Inicio</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                <Input
                                    id="time"
                                    type="time"
                                    className="pl-9"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Servicio</Label>
                            <Select value={serviceId} onValueChange={setServiceId} disabled={loadingServices}>
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingServices ? "Cargando servicios..." : "Seleccionar servicio..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingServices ? (
                                        <div className="flex items-center justify-center p-2 text-sm text-gray-500">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cargando...
                                        </div>
                                    ) : services.length > 0 ? (
                                        services.map((service) => (
                                            <SelectItem key={service.id} value={service.id}>
                                                {service.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500 text-center">No hay servicios disponibles</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading || !clientName || !startTime || !serviceId}>
                            {isLoading ? "Guardando..." : "Confirmar Cita"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
