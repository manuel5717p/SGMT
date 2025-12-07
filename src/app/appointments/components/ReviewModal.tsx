'use client'

import { useState } from "react"
import { Star } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { submitReview } from "../actions"
import { useRouter } from "next/navigation"

interface ReviewModalProps {
    appointmentId: string
    workshopId: string
    workshopName: string
    clientId: string
    isOpen: boolean
    onClose: () => void
}

export function ReviewModal({ appointmentId, workshopId, workshopName, clientId, isOpen, onClose }: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleRating = (value: number) => {
        setRating(value)
    }

    const handleSubmit = async () => {
        if (rating === 0) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('appointmentId', appointmentId)
        formData.append('workshopId', workshopId)
        formData.append('clientId', clientId)
        formData.append('rating', rating.toString())
        formData.append('comment', comment)

        try {
            await submitReview(formData)
            // Show toast here if we had the toast hook available, otherwise the UI update is enough
            onClose()
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Error al enviar la reseña")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl">¿Cómo fue tu experiencia?</DialogTitle>
                    <DialogDescription className="text-center">
                        Cuéntanos sobre tu visita a <strong>{workshopName}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="focus:outline-none transition-transform hover:scale-110"
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRating(star)}
                            >
                                <Star
                                    className={`w-12 h-12 ${star <= (hoverRating || rating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-gray-100 text-gray-300"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Cuéntanos más detalles (opcional)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="bg-green-500 hover:bg-green-600 text-white"
                    >
                        {isSubmitting ? "Enviando..." : "Enviar Reseña"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
