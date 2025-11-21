export type ExpenseCategory = 'FUEL' | 'TOLL' | 'PARKING' | 'FOOD' | 'ACCOMMODATION' | 'SHOPPING' | 'ENTERTAINMENT' | 'OTHER';
export type SplitMethod = 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE' | 'SHARES';

export interface Expense {
    id: string;
    ride_id: string;
    payer_id: string;
    description: string;
    amount: number;
    currency: string;
    category: ExpenseCategory;
    split_method: SplitMethod;
    created_at: string;
    updated_at: string;
    payer?: {
        full_name: string;
    };
    splits?: ExpenseSplit[];
}

export interface ExpenseSplit {
    id: string;
    expense_id: string;
    user_id: string;
    amount_owed: number;
    share_weight?: number;
    percentage?: number;
    is_settled: boolean;
    user?: {
        full_name: string;
        profile_picture_url?: string;
    };
}
