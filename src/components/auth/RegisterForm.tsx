"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { registerUser } from "@/app/auth/actions"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface RegisterFormProps {
    role: "client" | "admin"
    roleName: string
}

export function RegisterForm({ role, roleName }: RegisterFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            setIsLoading(false)
            return
        }

        formData.append("role", role)

        try {
            const result = await registerUser(formData)
            if (result.error) {
                setError(result.error)
            } else {
                setShowSuccess(true)
            }
        } catch (e) {
            setError("Ocurrió un error inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Nombres y Apellidos</Label>
                    <Input id="fullName" name="fullName" placeholder="Ingresa tus nombres y apellidos" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Número de Teléfono</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="999 999 999" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input id="email" name="email" type="email" placeholder="ejemplo@correo.com" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repite tu contraseña" minLength={8} required />
                </div>

                {error && (
                    <div className="text-sm text-red-500 font-medium">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Registrarme"}
                </Button>
            </form>

            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent className="sm:max-w-md text-center flex flex-col items-center justify-center p-8 gap-6 [&>button]:hidden">
                    <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-slate-900">¡Cuenta creada exitosamente!</h2>
                        <p className="text-slate-500">Usted se registró correctamente como {roleName}</p>
                    </div>
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <Link href="/auth/login">Ir al Login</Link>
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}
