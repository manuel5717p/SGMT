"use client"

import { useState, useEffect } from "react"
import { MapPin, Clock, Phone, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ServiceCard } from "@/components/shared/ServiceCard"
import { TimeSlot } from "@/components/shared/TimeSlot"
import { Textarea } from "@/components/ui/textarea"
import { createReservation, getBusySlots } from "@/app/actions"
// import { useToast } from "@/hooks/use-toast" 

interface Service {
    id: string
    title: string
    duration: number
    price: number
}

interface Workshop {
    id: string
    name: string
    address: string
    hours: string
    phone: string
    image: string
}

interface WorkshopBookingClientProps {
    workshop: Workshop
    services: Service[]
}

// Generate next 7 days dynamically
const getNext7Days = () => {
    const dates = []
    const today = new Date()
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

    for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)

        // Fix: Use local date components to avoid UTC shift
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const fullDate = `${year}-${month}-${day}`

        dates.push({
            day: days[d.getDay()],
            date: d.getDate(),
            fullDate: fullDate, // YYYY-MM-DD in local time
            month: d.getMonth()
        })
    }
    return dates
}

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "01:00", "01:30", "02:00", "02:30",
    "03:00", "03:30", "04:00", "04:30"
]

const DISABLED_SLOTS = ["10:00", "01:00", "04:00"] // Mock disabled slots

export default function WorkshopBookingClient({ workshop, services }: WorkshopBookingClientProps) {
    const [selectedServices, setSelectedServices] = useState<string[]>([])
    const [dates, setDates] = useState<any[]>([])
    const [selectedDateStr, setSelectedDateStr] = useState<string>("")
    const [busySlots, setBusySlots] = useState<string[]>([])
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [vehicleModel, setVehicleModel] = useState("")
    const [notes, setNotes] = useState("")
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        const nextDays = getNext7Days()
        setDates(nextDays)
        if (nextDays.length > 0) {
            setSelectedDateStr(nextDays[0].fullDate)
        }
    }, [])

    useEffect(() => {
        if (selectedDateStr && workshop.id) {
            getBusySlots(workshop.id, selectedDateStr).then(slots => {
                setBusySlots(slots)
            })
        }
    }, [selectedDateStr, workshop.id])

    const toggleService = (id: string) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const handleReservation = async () => {
        if (selectedServices.length === 0) {
            alert("Por favor selecciona al menos un servicio")
            return
        }
        if (!selectedTime) {
            alert("Por favor selecciona una hora")
            return
        }
        if (!vehicleModel.trim()) {
            alert("Por favor ingresa el modelo de tu moto")
            return
        }

        setIsPending(true)

        // Calculate total duration
        const totalDuration = services
            .filter(s => selectedServices.includes(s.id))
            .reduce((acc, curr) => acc + curr.duration, 0)

        // Use the first selected service ID for the main record, or handle multiple services logic


        const serviceId = selectedServices[0]

        const formData = new FormData()
        formData.append('workshopId', workshop.id.toString())
        formData.append('serviceId', serviceId.toString())
        formData.append('date', selectedDateStr)
        formData.append('time', selectedTime)
        formData.append('duration', totalDuration.toString())
        formData.append('vehicleModel', vehicleModel)
        formData.append('notes', notes)

        try {
            await createReservation(formData)
        } catch (error: any) {
            // Fix: Handle Next.js redirect error
            if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
                throw error
            }
            console.error(error)
            alert("Error al crear la reserva")
            setIsPending(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Hero Section */}
            <div className="relative h-48 md:h-64 w-full bg-slate-200 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/50 z-10" />
                <img
                    src={workshop.image || "https://images.unsplash.com/photo-1632823471565-1ec2a1ad4015?q=80&w=2669&auto=format&fit=crop"}
                    alt={workshop.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white bg-gradient-to-t from-black/80 to-transparent">
                    <h1 className="text-xl font-bold">{workshop.name}</h1>
                    <div className="flex flex-col gap-1 mt-1 text-xs md:text-sm opacity-90">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{workshop.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{workshop.hours}</span>
                        </div>
                    </div>
                </div>
                <Button
                    size="icon"
                    className="absolute top-4 right-4 z-30 bg-green-500 hover:bg-green-600 rounded-full h-10 w-10 shadow-lg"
                >
                    <Phone className="h-5 w-5 text-white" />
                </Button>
            </div>

            <div className="container mx-auto px-4 py-6 space-y-8 max-w-3xl">
                {/* Vehicle Model Input */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-900 mb-3">Mi Moto</h2>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            {/* Simple circle icon as requested/shown in image */}
                            <div className="h-5 w-5 rounded-full bg-green-600/20" />
                        </div>
                        <input
                            type="text"
                            value={vehicleModel}
                            onChange={(e) => setVehicleModel(e.target.value)}
                            placeholder="Ej: Honda CB 190R, Yamaha FZ 150..."
                            className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-sm"
                        />
                    </div>
                </section>

                {/* Services Menu */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-900 mb-3">Menú de Servicios</h2>
                    <div className="space-y-3">
                        {services.map((service) => (
                            <ServiceCard
                                key={service.id}
                                title={service.title}
                                duration={service.duration}
                                price={service.price}
                                checked={selectedServices.includes(service.id)}
                                onSelect={() => toggleService(service.id)}
                            />
                        ))}
                        {services.length === 0 && (
                            <p className="text-sm text-slate-500">No hay servicios disponibles.</p>
                        )}
                    </div>
                </section>

                {/* Calendar */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <CalendarIcon className="h-4 w-4 text-slate-500" />
                        <h2 className="text-sm font-semibold text-slate-900">Selecciona una fecha</h2>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {dates.map((date) => (
                            <button
                                key={date.fullDate}
                                onClick={() => setSelectedDateStr(date.fullDate)}
                                className={`
                  flex flex-col items-center justify-center min-w-[4.5rem] h-16 rounded-lg border text-sm transition-all
                  ${selectedDateStr === date.fullDate
                                        ? "bg-green-500 border-green-500 text-white shadow-md"
                                        : "bg-white border-slate-100 text-slate-500 hover:border-green-200 hover:bg-green-50"
                                    }
                `}
                            >
                                <span className="text-xs font-medium opacity-80">{date.day}</span>
                                <span className="text-lg font-bold">{date.date}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Schedule */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-900 mb-3">Horarios disponibles</h2>
                    <div className="grid grid-cols-3 gap-3">
                        {TIME_SLOTS.map((time) => {
                            const isBusy = busySlots.includes(time)

                            // Check for past time if selected date is today
                            let isPast = false
                            if (selectedDateStr) {
                                const now = new Date()
                                const selectedDate = new Date(selectedDateStr + 'T00:00:00') // Local time assumption for comparison
                                const today = new Date()
                                today.setHours(0, 0, 0, 0)
                                selectedDate.setHours(0, 0, 0, 0)

                                if (selectedDate.getTime() === today.getTime()) {
                                    const [hours, minutes] = time.split(':').map(Number)
                                    const slotTime = new Date()
                                    slotTime.setHours(hours, minutes, 0, 0)

                                    if (slotTime < now) {
                                        isPast = true
                                    }
                                }
                            }

                            const isDisabled = DISABLED_SLOTS.includes(time) || isBusy || isPast

                            return (
                                <TimeSlot
                                    key={time}
                                    time={time}
                                    selected={selectedTime === time}
                                    disabled={isDisabled}
                                    onClick={() => !isDisabled && setSelectedTime(time)}
                                    className={isBusy ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 line-through" : ""}
                                />
                            )
                        })}
                    </div>
                </section>

                {/* Additional Notes */}
                <section>
                    <h2 className="text-sm font-semibold text-slate-900 mb-3">Notas para el taller (Opcional)</h2>
                    <Textarea
                        placeholder="Ej: La moto hace un ruido al frenar, por favor revisar las pastillas..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-white border-slate-200"
                    />
                </section>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="container mx-auto max-w-3xl">
                    <Button
                        onClick={handleReservation}
                        disabled={isPending}
                        className="w-full h-12 text-base font-semibold shadow-md bg-green-500 hover:bg-green-600 text-white"
                    >
                        {isPending ? "Reservando..." : "Confirmar Reserva"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
