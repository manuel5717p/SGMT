import { Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface ServiceCardProps {
    title: string
    duration: string | number
    price: number
    onSelect?: (checked: boolean) => void
    checked?: boolean
}

export function ServiceCard({
    title,
    duration,
    price,
    onSelect,
    checked,
}: ServiceCardProps) {
    return (
        <div className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-1">
                <h3 className="text-sm font-medium text-slate-900">{title}</h3>
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{duration} min</span>
                    </div>
                    <span className="font-medium text-primary">
                        S/ {price.toFixed(2)}
                    </span>
                </div>
            </div>
            <Checkbox
                checked={checked}
                onCheckedChange={(checked) => onSelect?.(checked as boolean)}
                className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
        </div>
    )
}
