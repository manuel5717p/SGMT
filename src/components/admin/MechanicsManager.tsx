'use client'

import { useState, useEffect } from "react"
import { Plus, UserCog, Check, X, Edit2 } from "lucide-react"
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
import { createMechanic, getMechanics, updateMechanic } from "@/app/admin/mechanics-actions"

interface Mechanic {
    id: string
    name: string
    is_active: boolean
}

export default function MechanicsManager() {
    const [mechanics, setMechanics] = useState<Mechanic[]>([])
    const [capacity, setCapacity] = useState(1)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [mechanicName, setMechanicName] = useState("")

    // Inline editing state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState("")

    // Plan validation - only count ACTIVE mechanics
    const isFreePlan = capacity === 1
    const activeMechanicsCount = mechanics.filter(m => m.is_active).length
    const hasReachedLimit = isFreePlan && activeMechanicsCount >= 1

    useEffect(() => {
        loadMechanics()
    }, [])

    async function loadMechanics() {
        const data = await getMechanics()
        setMechanics(data.mechanics)
        setCapacity(data.capacity)
    }

    async function handleCreate() {
        if (!mechanicName.trim()) return

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", mechanicName)

            const result = await createMechanic(formData)
            if (result.error) throw new Error(result.error)

            setIsModalOpen(false)
            setMechanicName("")
            await loadMechanics()
        } catch (error) {
            console.error(error)
            alert("Error al crear mecánico")
        } finally {
            setIsLoading(false)
        }
    }

    function startEditing(mechanic: Mechanic) {
        setEditingId(mechanic.id)
        setEditingName(mechanic.name)
    }

    function cancelEditing() {
        setEditingId(null)
        setEditingName("")
    }

    async function saveEdit(id: string) {
        if (!editingName.trim()) {
            cancelEditing()
            return
        }

        try {
            const formData = new FormData()
            formData.append("id", id)
            formData.append("name", editingName)

            const result = await updateMechanic(formData)
            if (result.error) throw new Error(result.error)

            setEditingId(null)
            setEditingName("")
            await loadMechanics()
        } catch (error) {
            console.error(error)
            alert("Error al actualizar mecánico")
        }
    }

    function handleKeyDown(e: React.KeyboardEvent, id: string) {
        if (e.key === 'Enter') {
            saveEdit(id)
        } else if (e.key === 'Escape') {
            cancelEditing()
        }
    }

    return (
        <>
            {/* Add Mechanic Button */}
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
                disabled={hasReachedLimit}
                title={hasReachedLimit ? "Plan Gratuito: Solo puedes tener 1 mecánico. Actualiza tu plan para agregar más." : ""}
            >
                <UserCog className="w-4 h-4" />
                Agregar Mecánico
            </Button>

            {/* Mechanics List */}
            {mechanics.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 py-2">
                    <span className="text-sm text-slate-500 font-medium">Mecánicos:</span>
                    {mechanics.map((mechanic) => (
                        <div
                            key={mechanic.id}
                            className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1 text-sm"
                        >
                            {editingId === mechanic.id ? (
                                <>
                                    <Input
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(e, mechanic.id)}
                                        onBlur={() => saveEdit(mechanic.id)}
                                        autoFocus
                                        className="h-6 w-32 text-sm px-2"
                                    />
                                    <Check
                                        className="w-3 h-3 text-green-600 cursor-pointer"
                                        onClick={() => saveEdit(mechanic.id)}
                                    />
                                    <X
                                        className="w-3 h-3 text-red-600 cursor-pointer"
                                        onClick={cancelEditing}
                                    />
                                </>
                            ) : (
                                <>
                                    <span
                                        className="text-slate-700 cursor-pointer hover:text-slate-900"
                                        onClick={() => startEditing(mechanic)}
                                    >
                                        {mechanic.name}
                                    </span>
                                    <Edit2
                                        className="w-3 h-3 text-slate-400 cursor-pointer hover:text-slate-600"
                                        onClick={() => startEditing(mechanic)}
                                    />
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Agregar Mecánico</DialogTitle>
                        <DialogDescription>
                            Registra un nuevo mecánico para tu taller.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="mechanic-name">Nombre del Mecánico</Label>
                            <Input
                                id="mechanic-name"
                                placeholder="Ingrese el nombre de su mecánico. Ej: Pedro"
                                value={mechanicName}
                                onChange={(e) => setMechanicName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreate()
                                }}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={isLoading || !mechanicName.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? "Guardando..." : "Agregar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
