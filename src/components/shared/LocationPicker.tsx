'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Common fix for Leaflet icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

interface LocationPickerProps {
    value: { lat: number; lng: number } | null;
    onChange: (lat: number, lng: number) => void;
    forcedCenter?: { lat: number; lng: number } | null;
}

function MapUpdater({ center }: { center: { lat: number; lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo([center.lat, center.lng], 13, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

function LocationMarker({ value, onChange }: LocationPickerProps) {
    const map = useMap();

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng);
            // Don't flyTo on click to avoid disorienting user if they just want to place pin
        },
    });

    useEffect(() => {
        if (value) {
            map.flyTo([value.lat, value.lng], map.getZoom(), { duration: 1.0 });
        }
    }, [value, map]);

    return value === null ? null : (
        <Marker
            position={[value.lat, value.lng]}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onChange(position.lat, position.lng);
                },
            }}
        />
    );
}

export default function LocationPicker({ value, onChange, forcedCenter }: LocationPickerProps) {
    // Default center (Lima) if no value
    const defaultCenter = [-12.046374, -77.042793];
    const center = value ? [value.lat, value.lng] : defaultCenter;

    return (
        <div className="h-[300px] w-full rounded-md border border-slate-200 overflow-hidden relative z-0">
            <MapContainer
                center={center as L.LatLngExpression}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker value={value} onChange={onChange} />
                <MapUpdater center={forcedCenter || null} />
            </MapContainer>
        </div>
    );
}
