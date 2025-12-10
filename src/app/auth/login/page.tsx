"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/app/auth/actions"
import { Wrench } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)

        try {
            const result = await loginUser(formData)
            if (result?.error) {
                setError(result.error)
            }
            // If success, the server action redirects, so we don't need to do anything here
        } catch (e) {

            // However, if it's a real error:
            console.error(e)
            // setError("Ocurrió un error inesperado") 
            // Next.js redirects throw an error "NEXT_REDIRECT", we should ignore it.
        } finally {
            // We don't set loading to false if redirecting, to prevent UI flash
            // But if error, we do.
            // Since we can't easily distinguish redirect error from others without checking message,

            // If it throws (redirect), this finally block runs.
            // Let's check if we are still on the page? No easy way.

            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Wrench className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
                    <p className="text-slate-500">Ingresa a tu cuenta MotoFix</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-left">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" name="email" type="email" placeholder="ejemplo@correo.com" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" placeholder="Ingresa tu contraseña" required />
                        </div>

                        <div className="text-right">
                            <Link href="#" className="text-xs text-green-600 hover:underline">
                                Olvidé mi contraseña
                            </Link>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                            {isLoading ? "Entrando..." : "Entrar"}
                        </Button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-sm text-slate-500">
                    ¿No tienes cuenta?{" "}
                    <Link href="/auth/get-started" className="text-green-600 font-medium hover:underline">
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    )
}
