import { cn } from "@/lib/utils"

interface TimeSlotProps {
    time: string
    selected?: boolean
    disabled?: boolean
    onClick?: () => void
    className?: string
}

export function TimeSlot({
    time,
    selected,
    disabled,
    onClick,
    className,
}: TimeSlotProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "flex w-full items-center justify-center rounded-md py-2 text-sm font-medium transition-colors",
                // Default state
                "bg-slate-50 text-slate-900 hover:bg-slate-100",
                // Selected state
                selected && "bg-primary text-primary-foreground hover:bg-primary/90",
                // Disabled state
                disabled && "cursor-not-allowed text-slate-400 line-through opacity-70 hover:bg-slate-50",
                className
            )}
        >
            {time}
        </button>
    )
}
