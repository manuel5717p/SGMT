'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Workshop } from '../types';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for default marker icon in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Custom Green Icon
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function MapEffect({ selectedWorkshopId, workshops }: { selectedWorkshopId: string | null, workshops: Workshop[] }) {
    const map = useMap();

    useEffect(() => {
        if (selectedWorkshopId) {
            const workshop = workshops.find(w => w.id === selectedWorkshopId);
            if (workshop) {
                map.flyTo([workshop.location_lat, workshop.location_lng], 16, {
                    duration: 1.5
                });
            }
        }
    }, [selectedWorkshopId, workshops, map]);

    return null;
}

interface WorkshopMapProps {
    workshops: Workshop[];
    userLocation: { lat: number; lng: number } | null;
    onMarkerClick: (workshopId: string) => void;
    selectedWorkshopId: string | null;
}

function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function WorkshopMap({ workshops, userLocation, onMarkerClick, selectedWorkshopId }: WorkshopMapProps) {
    const defaultCenter = { lat: -12.046374, lng: -77.042793 }; // Lima
    const center = userLocation || defaultCenter;

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Effects */}
            <MapEffect selectedWorkshopId={selectedWorkshopId} workshops={workshops} />
            {userLocation && <MapUpdater center={userLocation} />}

            {/* User Location Marker */}
            {userLocation && (
                <Marker position={userLocation}>
                    <Popup>Tu ubicación actual</Popup>
                </Marker>
            )}

            {workshops.map((workshop) => (
                <Marker
                    key={workshop.id}
                    position={[workshop.location_lat, workshop.location_lng]}
                    icon={greenIcon}
                    eventHandlers={{
                        click: () => onMarkerClick(workshop.id),
                    }}
                >
                </Marker>
            ))}
        </MapContainer>
    );
}
