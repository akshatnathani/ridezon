import { ApiResponse } from '../api';
import { User } from '../../types/user';
import { MOCK_USERS } from './mockData';

export const authService = {
    login: async (email: string): Promise<ApiResponse<User>> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const user = MOCK_USERS.find((u) => u.email === email);
        if (user) {
            return { data: user, error: null };
        }
        return { data: null, error: 'Invalid credentials' };
    },

    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: MOCK_USERS.find(u => u.id === 'user_current') || null, error: null };
    },

    signup: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newUser: User = {
            id: `user_${Date.now()}`,
            email: userData.email!,
            full_name: userData.full_name!,
            gender: userData.gender || 'OTHER',
            is_email_verified: false,
            is_id_verified: false,
            account_status: 'PENDING',
            last_login_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...userData,
        };
        MOCK_USERS.push(newUser);
        return { data: newUser, error: null };
    }
};
