"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Calendar, LogOut, User } from "lucide-react"
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
import { useRouter } from "next/navigation"

export function ClientNavbar() {
    const pathname = usePathname()
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
        router.push('/auth/login')
    }

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                                <div className="h-4 w-4 border-2 border-white rounded-full" />
                            </div>
                            <span className="font-bold text-slate-700 text-lg">MotoFix</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/search"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/search'
                                    ? 'border-green-500 text-slate-900'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                <Search className="h-4 w-4 mr-2" />
                                Buscar Talleres
                            </Link>
                            <Link
                                href="/appointments"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/appointments'
                                    ? 'border-green-500 text-slate-900'
                                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }`}
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Mis Citas
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center">
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
                    </div>
                </div>
            </div>
        </header>
    )
}
