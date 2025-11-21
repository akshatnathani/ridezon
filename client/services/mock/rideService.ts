import { ApiResponse, PaginatedResponse } from '../api';
import { Ride, RideParticipant } from '../../types/ride';
import { MOCK_RIDES, MOCK_USERS } from './mockData';

export const rideService = {
    getAvailableRides: async (filters?: { from?: string; to?: string; date?: string; femaleOnly?: boolean; sortBy?: 'price_asc' }): Promise<PaginatedResponse<Ride>> => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        let rides = MOCK_RIDES.filter(r => r.status === 'PLANNED');

        if (filters) {
            if (filters.from) {
                rides = rides.filter(r => r.start_location_name.toLowerCase().includes(filters.from!.toLowerCase()));
            }
            if (filters.to) {
                rides = rides.filter(r => r.destination_name.toLowerCase().includes(filters.to!.toLowerCase()));
            }
            if (filters.femaleOnly) {
                rides = rides.filter(r => r.is_female_only);
            }
            if (filters.date) {
                const filterDate = new Date(filters.date);
                const isToday = new Date().toDateString() === filterDate.toDateString();
                const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === filterDate.toDateString();

                rides = rides.filter(r => {
                    const rideDate = new Date(r.scheduled_start_time);
                    if (isToday) {
                        return rideDate.toDateString() === new Date().toDateString();
                    }
                    if (isTomorrow) {
                        return rideDate.toDateString() === new Date(new Date().setDate(new Date().getDate() + 1)).toDateString();
                    }
                    return rideDate.toDateString() === filterDate.toDateString();
                });
            }
            if (filters.sortBy === 'price_asc') {
                rides.sort((a, b) => a.price_per_seat - b.price_per_seat);
            } else {
                // Default sort by time
                rides.sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());
            }
        } else {
            // Default sort by time if no filters
            rides.sort((a, b) => new Date(a.scheduled_start_time).getTime() - new Date(b.scheduled_start_time).getTime());
        }

        return {
            data: rides,
            total: rides.length,
            page: 1,
            pageSize: 10,
            error: null
        };
    },

    getRideById: async (id: string): Promise<ApiResponse<Ride>> => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const ride = MOCK_RIDES.find((r) => r.id === id);
        return { data: ride || null, error: ride ? null : 'Ride not found' };
    },

    createRide: async (rideData: Partial<Ride>): Promise<ApiResponse<Ride>> => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const newRide: Ride = {
            id: `ride_${Date.now()}`,
            organizer_id: 'user_current',
            start_location_name: rideData.start_location_name!,
            start_lat: rideData.start_lat!,
            start_lng: rideData.start_lng!,
            destination_name: rideData.destination_name!,
            dest_lat: rideData.dest_lat!,
            dest_lng: rideData.dest_lng!,
            scheduled_start_time: rideData.scheduled_start_time!,
            estimated_duration_minutes: rideData.estimated_duration_minutes || 30,
            transport_mode: rideData.transport_mode || 'CAR',
            total_seats: rideData.total_seats || 4,
            available_seats: rideData.total_seats || 4,
            price_per_seat: rideData.price_per_seat || 0,
            currency: 'USD',
            description: rideData.description || '',
            status: 'PLANNED',
            is_female_only: rideData.is_female_only || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            participants: [
                {
                    id: `part_${Date.now()}`,
                    ride_id: `ride_${Date.now()}`,
                    user_id: 'user_current',
                    role: 'ORGANIZER',
                    status: 'JOINED',
                    joined_at: new Date().toISOString(),
                    user: MOCK_USERS.find(u => u.id === 'user_current')
                }
            ]
        };
        MOCK_RIDES.push(newRide);
        return { data: newRide, error: null };
    },

    joinRide: async (rideId: string): Promise<ApiResponse<RideParticipant>> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const ride = MOCK_RIDES.find(r => r.id === rideId);
        if (!ride) return { data: null, error: 'Ride not found' };

        if (ride.available_seats <= 0) return { data: null, error: 'No seats available' };

        const newParticipant: RideParticipant = {
            id: `part_${Date.now()}`,
            ride_id: rideId,
            user_id: 'user_current',
            role: 'PASSENGER',
            status: 'JOINED',
            joined_at: new Date().toISOString(),
            user: MOCK_USERS.find(u => u.id === 'user_current')
        };

        if (!ride.participants) ride.participants = [];
        ride.participants.push(newParticipant);
        ride.available_seats -= 1;

        return { data: newParticipant, error: null };
    },

    deleteRide: async (rideId: string): Promise<ApiResponse<boolean>> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const index = MOCK_RIDES.findIndex(r => r.id === rideId);
        if (index === -1) return { data: false, error: 'Ride not found' };

        MOCK_RIDES.splice(index, 1);
        return { data: true, error: null };
    },

    leaveRide: async (rideId: string): Promise<ApiResponse<boolean>> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const ride = MOCK_RIDES.find(r => r.id === rideId);
        if (!ride) return { data: false, error: 'Ride not found' };

        if (!ride.participants) return { data: false, error: 'No participants found' };

        const participantIndex = ride.participants.findIndex(p => p.user_id === 'user_current');
        if (participantIndex === -1) return { data: false, error: 'You are not in this ride' };

        ride.participants.splice(participantIndex, 1);
        ride.available_seats += 1;

        return { data: true, error: null };
    }
};
