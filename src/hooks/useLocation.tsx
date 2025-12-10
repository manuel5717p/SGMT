import { useState, useEffect } from 'react';

export interface Location {
    lat: number;
    lng: number;
}

const DEFAULT_LOCATION: Location = {
    lat: -12.046374, // Centro de Lima
    lng: -77.042793,
};

export function useLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const requestLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocation(DEFAULT_LOCATION);
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.warn('Geolocation error:', err);
                setError('No se pudo obtener la ubicación. Usando ubicación por defecto.');
                setLocation(DEFAULT_LOCATION);
                setLoading(false);
            }
        );
    };



    return { location, setLocation, error, loading, requestLocation, DEFAULT_LOCATION };
}
