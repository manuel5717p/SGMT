import { Loader2 } from "lucide-react"

export default function AdminLoading() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <p className="text-slate-500 text-sm font-medium">Cargando panel de administración...</p>
        </div>
    )
}
