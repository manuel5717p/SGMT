import { Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface WorkshopListCardProps {
    id?: number | string
    name: string
    rating: number
    reviewCount: number
    distance: string
    onReserve?: () => void
}

export function WorkshopListCard({
    id,
    name,
    rating,
    reviewCount,
    distance,
    onReserve,
}: WorkshopListCardProps) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-slate-900">{name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-green-500 text-green-500" />
                            <span className="font-medium text-slate-900">{rating}</span>
                            <span>({reviewCount})</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{distance}</span>
                        </div>
                    </div>
                </div>
                {id ? (
                    <Button
                        asChild
                        className="h-8 px-4 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md"
                    >
                        <Link href={`/workshop/${id}`}>Reservar</Link>
                    </Button>
                ) : (
                    <Button
                        onClick={onReserve}
                        className="h-8 px-4 text-xs font-medium bg-green-500 hover:bg-green-600 text-white rounded-md"
                    >
                        Reservar
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
