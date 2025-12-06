import { Search, MapPin, ChevronDown, Navigation } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SUGGESTED_DISTRICTS } from '../types';

interface FilterBarProps {
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onLocationSelect: (locationName: string) => void;
    onUseMyLocation: () => void;
    currentLocationName: string;
    onCoordinatesChange?: (lat: number, lng: number) => void;
}

export function FilterBar({
    searchTerm,
    onSearchChange,
    onLocationSelect,
    onUseMyLocation,
    currentLocationName,
    onCoordinatesChange
}: FilterBarProps) {
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
                setIsLocationOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="bg-white border-b py-4 px-6 shadow-sm sticky top-0 z-20">
            <div className="max-w-7xl mx-auto flex gap-4 items-center">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, servicio o problema..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-gray-50 bg-opacity-50"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                    Buscar
                </button>

                {/* Location Dropdown */}
                <div className="relative" ref={locationRef}>
                    <button
                        onClick={() => setIsLocationOpen(!isLocationOpen)}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 min-w-[160px] justify-between"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{currentLocationName}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {isLocationOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border p-4 z-50">
                            <button
                                onClick={() => {
                                    onUseMyLocation();
                                    setIsLocationOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors mb-4"
                            >
                                <div className="bg-green-500 rounded-full p-1">
                                    <Navigation className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium">Usar mi ubicación actual</span>
                            </button>

                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Ingresar otro distrito o dirección"
                                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            const query = (e.target as HTMLInputElement).value;
                                            if (!query) return;

                                            try {
                                                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Peru')}`); // Appending Peru for context if local
                                                const data = await res.json();
                                                if (data && data.length > 0) {
                                                    const { lat, lon, display_name } = data[0];
                                                    onLocationSelect(display_name.split(',')[0]); // Use short name
                                                    if (onCoordinatesChange) {
                                                        onCoordinatesChange(parseFloat(lat), parseFloat(lon));
                                                    }
                                                    setIsLocationOpen(false);
                                                } else {
                                                    alert('No se encontraron resultados');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                alert('Error buscando dirección');
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <h4 className="text-gray-500 text-xs font-semibold uppercase mb-3">Sugerencias:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {SUGGESTED_DISTRICTS.map((district) => (
                                        <button
                                            key={district}
                                            onClick={() => {
                                                onLocationSelect(district);
                                                setIsLocationOpen(false);
                                            }}
                                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                                        >
                                            {district}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
