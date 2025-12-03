"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWorkshop } from "@/app/admin/actions"
import { signOutAction } from "@/app/auth/actions"
import { Store, MapPin, Clock } from "lucide-react"

const DISTRICTS = [
    "Los Olivos",
    "San Martín de Porres",
    "La Victoria",
    "San Isidro",
    "Miraflores",
    "Surco",
    "Comas",
    "Independencia",
    "Cercado de Lima"
]

export default function NewWorkshopPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        await createWorkshop(formData)

        // Redirect is handled in server action
        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-8 text-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Registra tu Taller</h1>
                    <p className="text-slate-500 mt-1">Completa la información para comenzar a gestionar tus citas</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Taller</Label>
                        <div className="relative">
                            <Store className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input id="name" name="name" className="pl-10" placeholder="Ej. MotoFix Los Olivos" required />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="district">Distrito</Label>
                            <select
                                id="district"
                                name="district"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {DISTRICTS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="address" name="address" className="pl-10" placeholder="Av. Universitaria 123" required />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="openingTime">Apertura</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="openingTime" name="openingTime" type="time" className="pl-10" defaultValue="08:00" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="closingTime">Cierre</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="closingTime" name="closingTime" type="time" className="pl-10" defaultValue="18:00" required />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                        {isLoading ? "Registrando..." : "Registrar Taller"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <form action={signOutAction}>
                        <button type="submit" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
