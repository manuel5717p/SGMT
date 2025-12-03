import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="w-full bg-white py-4 shadow-sm">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MOTOFIX</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Tu mejor opción</p>
          </div>
          <nav className="flex gap-6 text-sm font-medium text-slate-600">
            <Link href="#" className="hover:text-primary transition-colors">Inicio</Link>
            <Link href="#" className="hover:text-primary transition-colors">Nosotros</Link>
            <Link href="#" className="hover:text-primary transition-colors">Servicios</Link>
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
          {/* Card: Mi Vehículo */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col items-center pt-10 pb-2">
              <div className="h-24 w-24 rounded-full bg-primary mb-6"></div>
              <h3 className="text-xl font-bold text-slate-900">Mi Vehículo</h3>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-slate-500">
                Administra tu motocicleta, agenda servicios y mantén un historial completo de mantenimiento.
              </p>
            </CardContent>
            <CardFooter className="pb-10 px-8">
              <Button className="w-full h-12 text-base" asChild>
                <Link href="/auth/get-started">Entrar</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Card: Mi Taller */}
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-col items-center pt-10 pb-2">
              <div className="h-24 w-24 rounded-full bg-primary mb-6"></div>
              <h3 className="text-xl font-bold text-slate-900">Mi Taller</h3>
            </CardHeader>
            <CardContent className="text-center px-8 pb-8">
              <p className="text-slate-500">
                Gestiona tu taller, clientes, servicios y lleva un control completo de tu negocio.
              </p>
            </CardContent>
            <CardFooter className="pb-10 px-8">
              <Button className="w-full h-12 text-base" asChild>
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
