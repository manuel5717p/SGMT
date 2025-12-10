'use client';

import { useState, useEffect, useMemo, useRef, createRef } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { WorkshopCard } from './components/WorkshopCard';
import { Workshop } from './types';
import { useLocation } from '@/hooks/useLocation';
import { calculateDistance } from '@/utils/distance';

// Dynamic Import for Map to avoid SSR issues
const WorkshopMap = dynamic(() => import('./components/WorkshopMap'), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Cargando Mapa...</div>
});

export default function SearchPage() {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentLocationName, setCurrentLocationName] = useState('Los Olivos'); // Default/Initial
    const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);

    const { location: userLocation, setLocation, requestLocation } = useLocation();

    // Refs for scrolling to cards
    // Casting to any to avoid strict RefObject<T> vs RefObject<T|null> issues for now if necessary, or just using RefObject<HTMLDivElement>
    const cardRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});

    // Debounce value for search
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch when debounced term changes (or initial load)
    useEffect(() => {
        fetchWorkshops(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    async function fetchWorkshops(term: string) {
        setLoading(true);
        let query = supabase.from('workshops_with_rating').select('*');

        // Use RPC if there is a search term
        if (term.trim()) {
            const { data, error } = await supabase
                .rpc('search_workshops', { search_term: term });

            if (error) {
                console.error('Error searching workshops:', error);
            } else {
                setWorkshops((data as Workshop[]) || []);
                initializeRefs((data as Workshop[]) || []);
            }
        } else {
            // Fallback to default fetch
            const { data, error } = await query;

            if (error) {
                console.error('Error fetching workshops:', error);
            } else {
                setWorkshops((data as Workshop[]) || []);
                initializeRefs((data as Workshop[]) || []);
            }
        }
        setLoading(false);
    }

    const initializeRefs = (data: Workshop[]) => {
        data.forEach((w: Workshop) => {
            if (!cardRefs.current[w.id]) {
                cardRefs.current[w.id] = createRef<HTMLDivElement>();
            }
        });
    };

    const handleUseMyLocation = () => {
        requestLocation();
        setCurrentLocationName('Mi Ubicación');
    };

    const handleLocationSelect = (locName: string) => {
        // Logic to get coords for the district could go here
        // For now just update the name
        setCurrentLocationName(locName);
        // Ideally we would set useLocation to the center of that district
    };

    const handleMarkerClick = (id: string) => {
        setSelectedWorkshopId(id);
        const ref = cardRefs.current[id];
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const filteredWorkshops = useMemo(() => {
        // 1. Calculate Distances if userLocation exists
        let data = workshops.map(w => {
            if (userLocation) {
                const dist = calculateDistance(userLocation.lat, userLocation.lng, w.location_lat, w.location_lng);
                return { ...w, distance: dist };
            }
            return { ...w, distance: undefined };
        });

        // 2. Filter by Search Term
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            data = data.filter(w =>
                w.name.toLowerCase().includes(lower) ||
                (w.address && w.address.toLowerCase().includes(lower))
            );
        }

        // 3. Sort by distance if available, otherwise rating?
        // Mockup shows "Talleres cercanos", so distance sort is implied.
        if (userLocation) {
            data.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return data;
    }, [workshops, userLocation, searchTerm]);


    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Navbar />
            <FilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onLocationSelect={handleLocationSelect}
                onUseMyLocation={handleUseMyLocation}
                currentLocationName={currentLocationName}
                onCoordinatesChange={(lat, lng) => setLocation({ lat, lng })}
            />

            <div className="flex-1 flex overflow-hidden">
                {/* Map Section - Left (or Top on mobile, but req says Split Screen) */}
                <div className="w-2/3 relative border-r hidden md:block">
                    <WorkshopMap
                        workshops={filteredWorkshops}
                        userLocation={userLocation}
                        onMarkerClick={handleMarkerClick}
                        selectedWorkshopId={selectedWorkshopId}
                    />
                    {/* Map Branding Overlay if needed, or attribution is enough */}
                </div>

                {/* List Section - Right */}
                <div className="w-full md:w-1/3 overflow-y-auto px-4 py-6">
                    <div className="mb-4">
                        <h2 className="text-gray-700 font-medium">Talleres cercanos</h2>
                        <p className="text-sm text-gray-500">{filteredWorkshops.length} talleres encontrados</p>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Cargando talleres...</div>
                        ) : filteredWorkshops.map((workshop) => (
                            <WorkshopCard
                                key={workshop.id}
                                ref={cardRefs.current[workshop.id] as React.RefObject<HTMLDivElement>}
                                workshop={workshop}
                                distance={workshop.distance}
                                active={selectedWorkshopId === workshop.id}
                            />
                        ))}

                        {!loading && filteredWorkshops.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No se encontraron talleres con esos filtros.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
