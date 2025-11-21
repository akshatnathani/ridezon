import { ApiResponse, PaginatedResponse } from '../api';
import { ChatMessage } from '../../types/chat';
import { MOCK_CHATS, MOCK_USERS } from './mockData';

export const chatService = {
    getMessages: async (rideId: string): Promise<PaginatedResponse<ChatMessage>> => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        const messages = MOCK_CHATS.filter(m => m.ride_id === rideId).sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return {
            data: messages,
            total: messages.length,
            page: 1,
            pageSize: 50,
            error: null
        };
    },

    sendMessage: async (rideId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const newMessage: ChatMessage = {
            id: `msg_${Date.now()}`,
            ride_id: rideId,
            sender_id: 'user_current',
            content,
            type: 'TEXT',
            is_pinned: false,
            created_at: new Date().toISOString(),
            sender: MOCK_USERS.find(u => u.id === 'user_current')
        };
        MOCK_CHATS.unshift(newMessage);
        return { data: newMessage, error: null };
    }
};
