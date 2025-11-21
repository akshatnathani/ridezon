export type TransportMode = 'CAR' | 'BIKE' | 'TAXI' | 'OTHER';
export type RideStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type RideRole = 'ORGANIZER' | 'PASSENGER';
export type ParticipantStatus = 'JOINED' | 'LEFT' | 'REMOVED';

export interface Ride {
    id: string;
    organizer_id: string;
    college_id?: string;
    start_location_name: string;
    start_lat: number;
    start_lng: number;
    destination_name: string;
    dest_lat: number;
    dest_lng: number;
    scheduled_start_time: string;
    estimated_duration_minutes: number;
    transport_mode: TransportMode;
    total_seats: number;
    available_seats: number;
    price_per_seat: number;
    currency: string;
    description: string;
    status: RideStatus;
    is_female_only: boolean;
    created_at: string;
    updated_at: string;
    waypoints?: RideWaypoint[];
    participants?: RideParticipant[];
}

export interface RideWaypoint {
    id: string;
    ride_id: string;
    location_name: string;
    latitude: number;
    longitude: number;
    stop_order: number;
}

export interface RideParticipant {
    id: string;
    ride_id: string;
    user_id: string;
    role: RideRole;
    status: ParticipantStatus;
    joined_at: string;
    user?: {
        full_name: string;
        profile_picture_url?: string;
        phone?: string;
    };
}
