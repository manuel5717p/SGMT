import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Motorcycle, Wrench } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar Modificado */}
      <header className="w-full bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          
          {/* UNIFICACIÓN: Contenedor único con flex y gap-0 para pegar logo y texto */}
          <div className="flex items-center gap-0">
            {/* Componente de Imagen - Asegúrate de que el tamaño (width/height) sea adecuado */}
            <Image
              src="/logo.png" // Cambié /favicon.ico a /logo.png para mejor semántica, ajústalo si usas otro nombre
              alt="Logo Motofix"
              width={50} // Reducido para mejor alineación en la navbar
              height={50} // Reducido para mejor alineación en la navbar
              className="rounded-full object-cover" // Añadí clases de estilo
            />
            
            {/* Texto MOTOFIX */}
            <div className="text-left ml-2"> {/* Agregué ml-2 para un pequeño espacio visual después del logo */}
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MOTOFIX</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest">Tu mejor opción</p>
            </div>
          </div>
          
          {/* Opciones de navegación a la derecha */}
          <nav className="flex gap-3 text-sm font-medium text-slate-600">
            {/* Solo 'Inicio' y 'Contacto' */}
            <Link href="#" className="hover:text-primary transition-colors">Inicio</Link>
            <Link href="#" className="hover:text-primary transition-colors">Contacto</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center justify-center gap-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">TIPO DE USUARIO</h2>
          <p className="text-slate-500 text-lg">Ingresa por tu vehículo o tu taller</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          
          {/* Card: Mi Vehículo (Con ÍCONO DE MOTO) */}
          <Card className="border-none shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-white group">
            <CardHeader className="flex flex-col items-center pt-10 pb-2">
              {/* Ícono de Moto */}
              <div className="h-24 w-24 flex items-center justify-center rounded-full bg-primary mb-6 transition-transform duration-300 group-hover:scale-110">
                <Motorcycle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Mi Vehículo</h3>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-slate-500">
                Administra tu motocicleta, agenda servicios y mantén un historial completo de mantenimiento.
              </p>
            </CardContent>
            <CardFooter className="pb-10 px-8">
              <Button className="w-full h-12 text-base transition-transform duration-300 group-hover:brightness-110" asChild>
                <Link href="/auth/get-started">Entrar</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card: Mi Taller (Con ÍCONO DE LLAVE) */}
          <Card className="border-none shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:-translate-y-1 cursor-pointer bg-white group">
            <CardHeader className="flex flex-col items-center pt-10 pb-2">
               {/* Ícono de Llave de taller */}
              <div className="h-24 w-24 flex items-center justify-center rounded-full bg-primary mb-6 transition-transform duration-300 group-hover:scale-110">
                <Wrench className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Mi Taller</h3>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-slate-500">
                Gestiona tu taller, clientes, servicios y lleva un control completo de tu negocio.
              </p>
            </CardContent>
            <CardFooter className="pb-10 px-8">
              <Button className="w-full h-12 text-base transition-transform duration-300 group-hover:brightness-110" asChild>
                <Link href="/auth/get-started">Entrar</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-900 py-6 text-center">
        <p className="text-slate-400 text-sm">
          © MOTOFIX - Todos los derechos reservados
        </p>
      </footer>
    </div>
  )
}