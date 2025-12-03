"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { upsertService, deleteService } from "@/app/admin/actions"
import { Plus, Pencil, Trash2, Clock, DollarSign, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface Service {
    id: string
    name: string
    duration_minutes: number
    price: number
}

interface ServicesListProps {
    initialServices: Service[]
}

export function ServicesList({ initialServices }: ServicesListProps) {
    const [services, setServices] = useState<Service[]>(initialServices)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [currentService, setCurrentService] = useState<Service | null>(null)
    const router = useRouter()

    const handleOpenCreate = () => {
        setCurrentService(null)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (service: Service) => {
        setCurrentService(service)
        setIsDialogOpen(true)
    }

    const handleOpenDelete = (service: Service) => {
        setCurrentService(service)
        setIsDeleteDialogOpen(true)
    }

    async function onUpsert(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        if (currentService) {
            formData.append("id", currentService.id)
        }

        const result = await upsertService(formData)

        if (result.success) {
            setIsDialogOpen(false)
            router.refresh() // Refresh server data
        } else {
            alert(result.error) // Simple error handling
        }

        setIsLoading(false)
    }

    async function onDelete() {
        if (!currentService) return
        setIsLoading(true)

        const formData = new FormData()
        formData.append("id", currentService.id)

        const result = await deleteService(formData)

        if (result.success) {
            setIsDeleteDialogOpen(false)
            router.refresh()
        } else {
            alert(result.error)
        }

        setIsLoading(false)
    }

    return (
        <>
            <div className="flex items-center justify-between -mt-12 mb-6">
                {/* Title is in parent, button here to align? No, parent has title. 
                    I'll use a portal or just absolute positioning? 
                    Actually, I'll just render the button here and let the parent handle the title.
                    Wait, the parent renders the title. I can't easily put this button in the parent's header row without context.
                    I will modify the parent to NOT render the title, and render it here instead.
                 */}
                <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
                <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Acción
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {services.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No hay servicios registrados. ¡Crea el primero!
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {services.map((service) => (
                            <div key={service.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div>
                                    <h3 className="font-medium text-slate-900">{service.name}</h3>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {service.duration_minutes} min
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3.5 w-3.5" />
                                            S/ {service.price.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(service)} className="text-slate-400 hover:text-slate-600">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(service)} className="text-slate-400 hover:text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upsert Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentService ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onUpsert} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del servicio</Label>
                            <Input id="name" name="name" defaultValue={currentService?.name} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duración</Label>
                                <select
                                    id="duration"
                                    name="duration"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue={currentService?.duration_minutes || 30}
                                >
                                    <option value="30">30 min</option>
                                    <option value="45">45 min</option>
                                    <option value="60">60 min</option>
                                    <option value="90">90 min</option>
                                    <option value="120">120 min</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Precio (S/)</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={currentService?.price} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog (Using Dialog as AlertDialog alternative) */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Eliminar Servicio
                        </DialogTitle>
                        <DialogDescription>
                            ¿Estás seguro de que deseas eliminar "{currentService?.name}"? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={onDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                            {isLoading ? "Eliminando..." : "Eliminar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
