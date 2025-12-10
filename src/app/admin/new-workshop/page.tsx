"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWorkshop } from "@/app/admin/actions"
import { signOutAction } from "@/app/auth/actions"
import { Store, MapPin, Clock, Search, Phone } from "lucide-react"
import dynamic from "next/dynamic"
import { PERU_LOCATIONS, City, CITY_CENTER_COORDINATES } from "@/constants/peru-locations"

// Dynamically import map to avoid SSR issues
const LocationPicker = dynamic(() => import("@/components/shared/LocationPicker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-md flex items-center justify-center text-slate-400">Cargando mapa...</div>
})

export default function NewWorkshopPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCity, setSelectedCity] = useState<City | "">("")
    const [selectedDistrict, setSelectedDistrict] = useState("")
    const [address, setAddress] = useState("")
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
    const [isSearchingLocation, setIsSearchingLocation] = useState(false)
    const [locationError, setLocationError] = useState("")

    const districts = useMemo(() => {
        if (!selectedCity) return []
        return PERU_LOCATIONS[selectedCity]
    }, [selectedCity])

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const city = e.target.value as City
        setSelectedCity(city)
        setSelectedDistrict("")

        if (city && CITY_CENTER_COORDINATES[city]) {
            setMapCenter(CITY_CENTER_COORDINATES[city])
        }
    }

    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const district = e.target.value
        setSelectedDistrict(district)

        if (district && selectedCity) {
            // Optional: Try to center map on district
            try {
                const query = `${district}, ${selectedCity}, Peru`
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                    headers: { 'User-Agent': 'SGMT-Workshop-Registration/1.0' }
                })
                const data = await response.json()
                if (data && data.length > 0) {
                    setMapCenter({
                        lat: parseFloat(data[0].lat),
                        lng: parseFloat(data[0].lon)
                    })
                }
            } catch (err) {
                // Silently fail if district lookup fails, map stays on city center
            }
        }
    }

    const searchCoordinates = async () => {
        if (!address || !selectedCity || !selectedDistrict) {
            setLocationError("Por favor ingresa la ciudad, distrito y dirección primero")
            return
        }

        setIsSearchingLocation(true)
        setLocationError("")

        try {
            const query = `${address}, ${selectedDistrict}, ${selectedCity}, Peru`
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
                headers: {
                    'User-Agent': 'SGMT-Workshop-Registration/1.0'
                }
            })
            const data = await response.json()

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat)
                const lng = parseFloat(data[0].lon)
                setLocation({ lat, lng })
                setMapCenter({ lat, lng }) // Also center map there
            } else {
                setLocationError("No se encontraron coordenadas para esta dirección. Intenta ajustar el pin manualmente.")
            }
        } catch (error) {
            console.error("Geocoding error:", error)
            setLocationError("Error al buscar coordenadas. Intenta de nuevo o ajusta el pin manualmente.")
        } finally {
            setIsSearchingLocation(false)
        }
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!location) {
            setLocationError("Debes confirmar la ubicación en el mapa")
            return
        }

        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        // Add manual location fields 
        formData.set("location_lat", location.lat.toString())
        formData.set("location_lng", location.lng.toString())
        formData.set("city", selectedCity) // Explicitly allow selectedCity to match formData expectation if select name is "city"

        await createWorkshop(formData)

        // Redirect is handled in server action
        setIsLoading(false)
    }

    const isFormValid = location !== null && selectedCity !== "" && selectedDistrict !== ""

    const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                headers: {
                    'User-Agent': 'SGMT-Workshop-Registration/1.0'
                }
            })
            const data = await response.json()
            if (data && data.display_name) {
                // Construct a shorter address if possible, or use display_name

                const addr = data.address
                let formattedAddress = data.display_name

                if (addr) {
                    const road = addr.road || addr.street || ""
                    const number = addr.house_number || ""
                    if (road) {
                        formattedAddress = `${road} ${number}`.trim()
                    }
                }

                setAddress(formattedAddress)
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error)
        }
    }

    const handleLocationChange = (lat: number, lng: number) => {
        setLocation({ lat, lng })
        fetchAddressFromCoordinates(lat, lng)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100 my-8">
                <div className="mb-8 text-center">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Registra tu Taller</h1>
                    <p className="text-slate-500 mt-1">Completa la información para comenzar a gestionar tus citas</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Taller</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="name" name="name" className="pl-10" placeholder="Ej. MotoFix Los Olivos" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono / Celular</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="phone" name="phone" className="pl-10" placeholder="Ej. 999 888 777" required />
                            </div>
                        </div>
                    </div>

                    {/* Location Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad / Departamento</Label>
                            <select
                                id="city"
                                name="city"
                                value={selectedCity}
                                onChange={handleCityChange}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {Object.keys(PERU_LOCATIONS).map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">Distrito</Label>
                            <select
                                id="district"
                                name="district"
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                required
                                disabled={!selectedCity}
                            >
                                <option value="">Seleccionar...</option>
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Address & Map */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div className="flex gap-2 items-end">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="address">Dirección Exacta</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="address"
                                        name="address"
                                        className="pl-10"
                                        placeholder="Av. Universitaria 123"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={searchCoordinates}
                                disabled={isSearchingLocation}
                                className="mb-px"
                            >
                                {isSearchingLocation ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                <span className="ml-2 hidden md:inline">Buscar Coordenadas</span>
                            </Button>
                        </div>

                        {locationError && (
                            <p className="text-sm text-red-500">{locationError}</p>
                        )}

                        <div className="space-y-2">
                            <Label>Ubicación en Mapa (Mueve el pin si es necesario)</Label>
                            <LocationPicker
                                value={location}
                                onChange={handleLocationChange}
                                forcedCenter={mapCenter}
                            />
                            <p className="text-xs text-slate-500">
                                {location ? `Coordenadas: ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Usa el botón de buscar o haz clic en el mapa para ubicar tu taller."}
                            </p>
                            {/* Hidden inputs to ensure logic works if JS fails or for standard form submission flows (though we override in onSubmit) */}
                            <input type="hidden" name="location_lat" value={location?.lat || ""} />
                            <input type="hidden" name="location_lng" value={location?.lng || ""} />
                        </div>
                    </div>

                    {/* Times */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-2">
                            <Label htmlFor="openingTime">Apertura</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="openingTime" name="openingTime" type="time" className="pl-10" defaultValue="08:00" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="closingTime">Cierre</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input id="closingTime" name="closingTime" type="time" className="pl-10" defaultValue="18:00" required />
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                        disabled={isLoading || !isFormValid}
                    >
                        {isLoading ? "Registrando..." : "Registrar Taller"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <form action={signOutAction}>
                        <button type="submit" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                            Cerrar Sesión
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
