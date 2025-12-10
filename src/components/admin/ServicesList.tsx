'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Clock, Pencil, Trash2 } from "lucide-react"
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
import { upsertService, deleteService } from "@/app/admin/actions"

interface Service {
    id: string
    name: string
    duration_minutes: number
    price: number
}

export default function ServicesList({ initialServices }: { initialServices: Service[] }) {
    const router = useRouter()
    console.log('[ServicesList] Received initialServices:', initialServices)
    console.log('[ServicesList] initialServices.length:', initialServices?.length || 0)
    const [services, setServices] = useState<Service[]>(initialServices || [])

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Service | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        duration: "",
        price: ""
    })

    // Delete Alert State
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

    const handleOpenCreate = () => {
        setEditingService(null)
        setFormData({ name: "", duration: "", price: "" })
        setIsModalOpen(true)
    }

    const handleOpenEdit = (service: Service) => {
        setEditingService(service)
        setFormData({
            name: service.name,
            duration: service.duration_minutes.toString(),
            price: service.price.toString()
        })
        setIsModalOpen(true)
    }

    const handleOpenDelete = (service: Service) => {
        setServiceToDelete(service)
        setIsDeleteOpen(true)
    }

    const handleSave = async () => {
        if (!formData.name || !formData.duration || !formData.price) return

        setIsLoading(true)
        try {
            const data = new FormData()
            if (editingService) data.append("id", editingService.id)
            data.append("name", formData.name)
            data.append("duration", formData.duration)
            data.append("price", formData.price)

            const result = await upsertService(data)
            if (result.error) throw new Error(result.error)

            setIsModalOpen(false)
            setFormData({ name: "", duration: "", price: "" })
            console.log('[ServicesList] Calling router.refresh()...')
            router.refresh()
            console.log('[ServicesList] router.refresh() called successfully')
        } catch (error) {
            console.error(error)
            alert("Error al guardar el servicio")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!serviceToDelete) return

        try {
            const data = new FormData()
            data.append("id", serviceToDelete.id)

            const result = await deleteService(data)
            if (result.error) throw new Error(result.error)

            setIsDeleteOpen(false)
            setServiceToDelete(null)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Error al eliminar el servicio")
        }
    }

    return (
        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="p-6">
                {/* List */}
                <div className="space-y-4">
                    <div className="flex justify-end mb-6">
                        <Button onClick={handleOpenCreate} className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Acción
                        </Button>
                    </div>

                    {services.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No hay servicios registrados.</p>
                    )}

                    {services.map((service) => (
                        <div key={service.id} className="group flex items-start justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                            <div>
                                <h3 className="font-semibold text-slate-800">{service.name}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{service.duration_minutes} min</span>
                                    </div>
                                    <div className="font-medium text-slate-700">
                                        S/ {service.price.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(service)} className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(service)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingService ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
                        <DialogDescription>
                            Configure los detalles del servicio.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej. Cambio de Aceite"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duración (min)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="30"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Precio (S/)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={isLoading || !formData.name}>
                            {isLoading ? "Guardando..." : "Guardar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará el servicio permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
