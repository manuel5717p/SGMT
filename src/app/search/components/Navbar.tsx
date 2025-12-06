import Link from 'next/link';
import { Calendar, Search, User } from 'lucide-react';

export function Navbar() {
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
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                    <User className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </nav>
    );
}
