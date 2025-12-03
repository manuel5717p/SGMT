import Link from "next/link"
import { Wrench, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GetStartedPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 text-center">
                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <div className="h-16 w-16 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Wrench className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">MotoFix</h1>
                </div>

                {/* Welcome Text */}
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-slate-900">Bienvenido</h2>
                    <p className="text-slate-500">Selecciona tu perfil para comenzar</p>
                </div>

                {/* Role Selection Cards */}
                <div className="space-y-4">
                    <Link href="/auth/register/client" className="block group">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all flex items-center gap-4 text-left">
                            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                                <Bike className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Soy Motero</h3>
                                <p className="text-sm text-slate-500">Busco talleres y agenciando servicios</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/auth/register/admin" className="block group">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all flex items-center gap-4 text-left">
                            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                                <Wrench className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Soy Taller</h3>
                                <p className="text-sm text-slate-500">Gestiono mis citas y clientes</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer */}
                <div className="text-sm text-slate-500">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/auth/login" className="text-green-600 font-medium hover:underline">
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    )
}
