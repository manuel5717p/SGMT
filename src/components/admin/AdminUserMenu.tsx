"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createBrowserClient } from "@/lib/supabase"

export function AdminUserMenu() {
    const router = useRouter()
    const [userEmail, setUserEmail] = useState<string>("Cargando...")

    useEffect(() => {
        const getUser = async () => {
            try {
                const supabase = createBrowserClient()
                const { data: { user }, error } = await supabase.auth.getUser()

                if (error || !user) {
                    setUserEmail("Invitado")
                    return
                }

                setUserEmail(user.email || "Usuario sin email")
            } catch (error) {
                console.error("Error fetching user:", error)
                setUserEmail("Invitado")
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        const supabase = createBrowserClient()
        await supabase.auth.signOut()
        router.push('/')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors">
                        <User className="h-5 w-5 text-slate-500" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
