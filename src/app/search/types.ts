export interface Workshop {
    id: string; // or number, depends on DB. Assuming string (uuid) or number.
    name: string;
    address: string;
    average_rating: number;
    review_count: number;
    location_lat: number;
    location_lng: number;
    distance?: number;
    city?: string;
    district?: string;
    phone?: string;
    // Add other fields if necessary
}

export type District = 'Lima' | 'Piura' | 'Arequipa' | 'Callao' | 'Cusco' | 'Trujillo';

export const SUGGESTED_DISTRICTS: District[] = ['Lima', 'Piura', 'Arequipa', 'Callao', 'Cusco', 'Trujillo'];
