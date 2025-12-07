'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Search, User, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
    const [userEmail, setUserEmail] = useState<string>("Cargando...");
    const router = useRouter();

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    setUserEmail("Invitado");
                    return;
                }

                setUserEmail(user.email || "Usuario sin email");
            } catch (error) {
                console.error("Error fetching user:", error);
                setUserEmail("Invitado");
            }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                    {/* Logo Mock */}
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                    <span className="font-bold text-gray-800 text-lg">MotoFix</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/search" className="flex items-center gap-2 text-green-600 font-medium px-2 py-1 border-b-2 border-green-500">
                        <Search className="w-4 h-4" />
                        <span>Buscar Talleres</span>
                    </Link>
                    <Link href="/appointments" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium px-2 py-1">
                        <Calendar className="w-4 h-4" />
                        <span>Mis Citas</span>
                    </Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            <User className="w-5 h-5 text-gray-600" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Mi Cuenta</p>
                                <p className="text-xs leading-none text-muted-foreground text-gray-500">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    );
}
