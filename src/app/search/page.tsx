import { SlidersHorizontal, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { WorkshopListCard } from "@/components/shared/WorkshopListCard"
import { supabase } from "@/lib/supabase"
import { ClientNavbar } from "@/components/shared/ClientNavbar"

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams

    let query = supabase.from('workshops').select('*')

    if (q) {
        query = query.ilike('district', `%${q}%`)
    }

    const { data: workshops } = await query

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header */}
            <ClientNavbar />

            {/* Sub-Header for Search (Mobile/Desktop) */}
            <div className="bg-white px-4 py-3 shadow-sm z-10 border-t border-slate-100">
                <div className="flex items-center gap-3 max-w-7xl mx-auto">
                    <form action="/search" className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            name="q"
                            defaultValue={q}
                            placeholder="Buscar por distrito..."
                            className="pl-9 bg-slate-50 border-slate-200 h-10 text-sm"
                        />
                    </form>
                    <Button size="icon" variant="outline" className="h-10 w-10 shrink-0 border-slate-200 text-slate-600 bg-green-500 hover:bg-green-600 hover:text-white border-none">
                        <SlidersHorizontal className="h-4 w-4 text-white" />
                    </Button>
                </div>
            </div>

            {/* Map Placeholder (Top Half) */}
            <div className="h-[40vh] bg-slate-200 relative w-full overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="text-slate-400 font-medium flex flex-col items-center gap-2">
                    <MapPin className="h-8 w-8" />
                    <span>Google Maps Here</span>
                </div>

                {/* Mock Map Pins */}
                <div className="absolute top-1/4 left-1/4">
                    <MapPin className="h-8 w-8 text-green-500 fill-green-500 drop-shadow-md" />
                </div>
                <div className="absolute top-1/2 right-1/3">
                    <MapPin className="h-8 w-8 text-green-500 fill-green-500 drop-shadow-md" />
                </div>
                <div className="absolute bottom-1/3 left-1/2">
                    <MapPin className="h-8 w-8 text-green-500 fill-green-500 drop-shadow-md" />
                </div>
            </div>

            {/* Workshop List (Bottom Half) */}
            <div className="flex-1 overflow-y-auto bg-slate-50 -mt-4 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-0 relative">
                <div className="p-4 space-y-4 pb-24">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-bold text-slate-900 text-lg">Talleres cercanos</h2>
                        <span className="text-xs text-slate-500">{workshops?.length || 0} talleres encontrados</span>
                    </div>

                    <div className="space-y-3">
                        {workshops?.map((workshop) => (
                            <WorkshopListCard
                                key={workshop.id}
                                id={workshop.id}
                                name={workshop.name}
                                rating={0}
                                reviewCount={0}
                                distance={"0.5km"}
                            />
                        ))}
                        {(!workshops || workshops.length === 0) && (
                            <div className="text-center py-10 text-slate-500 text-sm">
                                No se encontraron talleres{q ? ` en "${q}"` : ''}.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
