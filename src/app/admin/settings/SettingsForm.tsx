"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateWorkshopSettings } from "@/app/admin/actions"
import { Crown, AlertTriangle, Lock, Check, Building2, MapPin, Phone } from "lucide-react"

interface SettingsFormProps {
    workshop: any
}

export function SettingsForm({ workshop }: SettingsFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [capacity, setCapacity] = useState(workshop.simultaneous_capacity || 1)
    const [showSuccess, setShowSuccess] = useState(false)

    // Dynamic plan detection based on simultaneous_capacity
    const isFreePlan = workshop.simultaneous_capacity === 1

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setShowSuccess(false)

        const formData = new FormData(event.currentTarget)
        formData.append("id", workshop.id)
        formData.append("capacity", capacity.toString())

        const result = await updateWorkshopSettings(formData)

        if (result.success) {
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
        }

        setIsLoading(false)
    }

    const handleCapacityChange = (delta: number) => {
        if (isFreePlan && delta > 0) return // Block increase for free plan
        const newCapacity = Math.max(1, capacity + delta)
        setCapacity(newCapacity)
    }

    return (
        <div className="grid gap-6">
            {/* Plan & Capacity Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Tu plan actual</CardTitle>
                    <div className="mt-2">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            PLAN GRATUITO
                        </span>
                    </div>
                    <CardDescription className="mt-2">
                        Estás operando con las funciones básicas
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 h-12 text-base">
                        <Crown className="h-5 w-5" />
                        Mejorar a PRO (S/ 29.90)
                    </Button>

                    <div className="space-y-2">
                        <p className="text-sm text-slate-500">Con el Plan PRO obtendrás:</p>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                Atención simultánea ilimitada
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                Reportes avanzados
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                Soporte prioritario
                            </li>
                        </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="font-medium text-slate-900 mb-2">Capacidad de atención</h3>
                        <p className="text-sm text-slate-500 mb-4">¿Cuántas motos puedes atender al mismo tiempo?</p>

                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleCapacityChange(-1)}
                                disabled={capacity <= 1}
                            >
                                -
                            </Button>
                            <div className="w-20 text-center font-medium text-lg border rounded-md py-1.5 bg-slate-50">
                                {capacity}
                            </div>
                            <div className="relative">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleCapacityChange(1)}
                                    disabled={isFreePlan}
                                    className={isFreePlan ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    +
                                </Button>
                                {isFreePlan && (
                                    <Lock className="h-3 w-3 text-slate-400 absolute -top-1 -right-1" />
                                )}
                            </div>
                        </div>

                        {isFreePlan && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md flex gap-3 items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-yellow-800">
                                    <span className="font-medium">Los talleres gratuitos están limitados a 1 atención simultánea.</span> Pásate a PRO para desbloquear más espacios.
                                </p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Workshop Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del taller</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2 text-slate-600">
                                <Building2 className="h-4 w-4" />
                                Nombre del taller
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={workshop.name}
                                placeholder="Ej: Taller Pedrito"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="flex items-center gap-2 text-slate-600">
                                <MapPin className="h-4 w-4" />
                                Dirección
                            </Label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue={workshop.address}
                                placeholder="Ej: Av. Principal 123, Lima"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2 text-slate-600">
                                <Phone className="h-4 w-4" />
                                Teléfono
                            </Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={workshop.phone || ""}
                                placeholder="Ej: +51 999 888 777"
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                                {isLoading ? "Guardando..." : "Guardar cambios"}
                            </Button>
                        </div>

                        {showSuccess && (
                            <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm text-center animate-in fade-in slide-in-from-bottom-2">
                                Configuración actualizada correctamente
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
