"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface WorkshopGuardProps {
    children: React.ReactNode
    hasWorkshop: boolean
}

export function WorkshopGuard({ children, hasWorkshop }: WorkshopGuardProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // If user has NO workshop and is NOT on new-workshop page -> Redirect to new-workshop
        if (!hasWorkshop && !pathname.includes('/admin/new-workshop')) {
            router.push('/admin/new-workshop')
            return
        }

        // If user HAS workshop and IS on new-workshop page -> Redirect to dashboard
        if (hasWorkshop && pathname.includes('/admin/new-workshop')) {
            router.push('/admin/dashboard')
            return
        }

        // If checks pass, stop loading
        setIsChecking(false)
    }, [hasWorkshop, pathname, router])

    if (isChecking) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                <p className="text-slate-500 text-sm font-medium">Verificando taller...</p>
            </div>
        )
    }

    return <>{children}</>
}
