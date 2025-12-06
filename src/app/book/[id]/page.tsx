import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import WorkshopBookingClient from "./WorkshopBookingClient"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function BookingPage({ params }: PageProps) {
    const { id } = await params

    // Fetch workshop details
    const { data: workshopData, error: workshopError } = await supabase
        .from('workshops')
        .select('id, name, address, opening_time, closing_time, image_url')
        .eq('id', id)
        .single()

    if (workshopError || !workshopData) {
        notFound()
    }

    // Transform workshop data
    const formatTime = (time: string) => time?.slice(0, 5) || ""

    const workshop = {
        id: workshopData.id,
        name: workshopData.name,
        address: workshopData.address,
        hours: `${formatTime(workshopData.opening_time)} - ${formatTime(workshopData.closing_time)}`,
        phone: "+51 999 999 999", // Placeholder
        image: workshopData.image_url
    }

    // Fetch services
    const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name, duration_minutes, price_pe_soles')
        .eq('workshop_id', id)

    // Transform services data
    const services = (servicesData || []).map(service => ({
        id: service.id,
        title: service.name,
        duration: service.duration_minutes,
        price: service.price_pe_soles || 0
    }))

    return (
        <WorkshopBookingClient
            workshop={workshop}
            services={services}
        />
    )
}
