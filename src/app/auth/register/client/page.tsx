import { RegisterForm } from "@/components/auth/RegisterForm"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ClientRegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative">
                <Link href="/auth/get-started" className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>

                <div className="mb-8 text-center pt-8">
                    <h1 className="text-2xl font-bold text-slate-900">Únete a MotoFix</h1>
                    <p className="text-slate-500 mt-1">Crea tu cuenta para reservar en los mejores talleres</p>
                </div>

                <RegisterForm role="client" roleName="Motero" />
            </div>
        </div>
    )
}
