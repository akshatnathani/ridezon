export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM' | 'POLL';

export interface ChatMessage {
    id: string;
    ride_id: string;
    sender_id: string;
    content?: string;
    type: MessageType;
    is_pinned: boolean;
    created_at: string;
    sender?: {
        full_name: string;
        profile_picture_url?: string;
    };
    poll?: Poll;
}

export interface Poll {
    id: string;
    message_id: string;
    question: string;
    is_active: boolean;
    created_at: string;
    options: PollOption[];
}

export interface PollOption {
    id: string;
    poll_id: string;
    text: string;
    votes?: PollVote[];
}

export interface PollVote {
    id: string;
    poll_id: string;
    option_id: string;
    user_id: string;
    created_at: string;
}
