import { POPULAR_LOCATIONS } from '@/constants/locations';

export interface LocationResult {
    id: string;
    name: string;
    address: string;
}

// Mock database of places to simulate search results
const MOCK_PLACES = [
    { id: 'starbucks_1', name: 'Starbucks Coffee', address: 'Omaxe Mall, Patiala' },
    { id: 'starbucks_2', name: 'Starbucks', address: 'Urban Estate Phase 2, Patiala' },
    { id: 'dominos_1', name: "Domino's Pizza", address: 'Leela Bhawan, Patiala' },
    { id: 'kfc_1', name: 'KFC', address: 'Bhupindra Road, Patiala' },
    { id: 'gym_1', name: 'Gold\'s Gym', address: 'Model Town, Patiala' },
    { id: 'gym_2', name: 'Anytime Fitness', address: 'Urban Estate, Patiala' },
    { id: 'hospital_1', name: 'Columbia Asia Hospital', address: 'Bhupindra Road, Patiala' },
    { id: 'hospital_2', name: 'Amar Hospital', address: 'Bank Colony, Patiala' },
    { id: 'thapar_poly', name: 'Thapar Polytechnic', address: 'Thapar University Campus, Patiala' },
    { id: 'cos', name: 'COS Complex', address: 'Thapar University, Patiala' },
];

export const locationService = {
    searchPlaces: async (query: string): Promise<LocationResult[]> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!query) return [];

        const lowerQuery = query.toLowerCase();

        // Search in mock places
        const results = MOCK_PLACES.filter(
            (place) =>
                place.name.toLowerCase().includes(lowerQuery) ||
                place.address.toLowerCase().includes(lowerQuery)
        );

        // Also search in popular locations (from constants)
        const popularMatches = POPULAR_LOCATIONS.filter(
            (place) =>
                place.name.toLowerCase().includes(lowerQuery) ||
                place.address.toLowerCase().includes(lowerQuery)
        );

        // Combine and deduplicate by ID
        const allResults = [...results, ...popularMatches];
        const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());

        return uniqueResults;
    },
};
