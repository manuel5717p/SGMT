import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Workshop } from '../types';
import { forwardRef } from 'react';

interface WorkshopCardProps {
    workshop: Workshop;
    distance?: number; // Distance in km
    active?: boolean;
}

export const WorkshopCard = forwardRef<HTMLDivElement, WorkshopCardProps>(
    ({ workshop, distance, active }, ref) => {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-xl shadow-sm border p-4 transition-all duration-200 ${active ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-100 hover:shadow-md'
                    }`}
            >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{workshop.name}</h3>
                        <div className="flex items-center text-amber-400 mt-1 space-x-1">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-sm">{workshop.average_rating || '0.0'}</span>
                            <span className="text-gray-400 text-sm">({workshop.review_count || 0})</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center text-gray-500 text-sm mb-4 space-x-4">
                    {distance !== undefined && (
                        <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{distance.toFixed(1)}km</span>
                        </div>
                    )}
                    <span className='truncate max-w-[200px]'>{workshop.address || 'Dirección no disponible'}</span>
                </div>

                <Link href={`/book/${workshop.id}`} className="w-full block">
                    <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer">
                        Reservar
                    </button>
                </Link>
            </div>
        );
    }
);

WorkshopCard.displayName = 'WorkshopCard';
