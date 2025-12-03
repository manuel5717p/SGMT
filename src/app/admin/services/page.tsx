import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { ServicesList } from "./services-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ServicesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: workshop } = await supabase
        .from('workshops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!workshop) redirect('/admin/new-workshop')

    const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('workshop_id', workshop.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Servicios</h1>
                {/* The button is handled in the client component for the dialog trigger, 
                    but the prompt asks for the button in the header. 
                    I will pass the trigger to the client component or make the button trigger the dialog from outside.
                    Better: Pass the button as a child or just render the ServicesList which includes the header actions?
                    The prompt says: "Header: Título... y un botón...".
                    I'll put the button inside ServicesList to control the Dialog state easily.
                    Wait, the prompt says "Header: Título... y un botón...".
                    I will render the title here and the ServicesList below. 
                    Actually, to open the dialog from the header button, I need shared state.
                    I will make ServicesList handle the whole section including the header button for simplicity,
                    OR I will wrap everything in a client component.
                    Let's make ServicesList the main container that accepts initialServices.
                */}
            </div>

            <ServicesList initialServices={services || []} />
        </div>
    )
}
