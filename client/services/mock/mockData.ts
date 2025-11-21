import { College, User } from '../../types/user';
import { Ride } from '../../types/ride';
import { ChatMessage } from '../../types/chat';
import { Expense } from '../../types/expense';

export const MOCK_COLLEGES: College[] = [
    {
        id: 'col_1',
        name: 'MIT',
        email_domain: 'mit.edu',
        location_name: 'Cambridge, MA',
        latitude: 42.3601,
        longitude: -71.0942,
        created_at: new Date().toISOString(),
    },
    {
        id: 'col_2',
        name: 'Harvard',
        email_domain: 'harvard.edu',
        location_name: 'Cambridge, MA',
        latitude: 42.3770,
        longitude: -71.1167,
        created_at: new Date().toISOString(),
    },
];

export const MOCK_USERS: User[] = [
    {
        id: 'user_1',
        email: 'alice@mit.edu',
        full_name: 'Alice Johnson',
        college_id: 'col_1',
        gender: 'FEMALE',
        is_email_verified: true,
        is_id_verified: true,
        account_status: 'ACTIVE',
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_picture_url: 'https://i.pravatar.cc/150?u=alice',
    },
    {
        id: 'user_2',
        email: 'bob@mit.edu',
        full_name: 'Bob Smith',
        college_id: 'col_1',
        gender: 'MALE',
        is_email_verified: true,
        is_id_verified: true,
        account_status: 'ACTIVE',
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_picture_url: 'https://i.pravatar.cc/150?u=bob',
    },
    {
        id: 'user_current',
        email: 'me@mit.edu',
        full_name: 'John Doe',
        college_id: 'col_1',
        gender: 'MALE',
        is_email_verified: true,
        is_id_verified: true,
        account_status: 'ACTIVE',
        last_login_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile_picture_url: 'https://i.pravatar.cc/150?u=me',
    },
];

export const MOCK_RIDES: Ride[] = [
    {
        id: 'ride_1',
        organizer_id: 'user_1',
        start_location_name: 'MIT Student Center',
        start_lat: 42.3591,
        start_lng: -71.0947,
        destination_name: 'Logan Airport',
        dest_lat: 42.3656,
        dest_lng: -71.0096,
        scheduled_start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimated_duration_minutes: 25,
        transport_mode: 'TAXI',
        total_seats: 4,
        available_seats: 2,
        price_per_seat: 15.00,
        currency: 'USD',
        description: 'Heading to the airport for spring break!',
        status: 'PLANNED',
        is_female_only: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: [
            {
                id: 'part_1',
                ride_id: 'ride_1',
                user_id: 'user_1',
                role: 'ORGANIZER',
                status: 'JOINED',
                joined_at: new Date().toISOString(),
                user: MOCK_USERS[0],
            },
            {
                id: 'part_2',
                ride_id: 'ride_1',
                user_id: 'user_current',
                role: 'PASSENGER',
                status: 'JOINED',
                joined_at: new Date().toISOString(),
                user: MOCK_USERS[2],
            }
        ]
    },
];

export const MOCK_CHATS: ChatMessage[] = [
    {
        id: 'msg_1',
        ride_id: 'ride_1',
        sender_id: 'user_1',
        content: 'Hey everyone, excited for the trip!',
        type: 'TEXT',
        is_pinned: false,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        sender: MOCK_USERS[0],
    }
];

export const MOCK_EXPENSES: Expense[] = [];
