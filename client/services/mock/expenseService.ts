import { ApiResponse } from '../api';
import { Expense } from '../../types/expense';
import { MOCK_EXPENSES, MOCK_USERS } from './mockData';

export const expenseService = {
    getExpenses: async (rideId: string): Promise<ApiResponse<Expense[]>> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const expenses = MOCK_EXPENSES.filter(e => e.ride_id === rideId);
        return { data: expenses, error: null };
    },

    addExpense: async (expenseData: Partial<Expense>): Promise<ApiResponse<Expense>> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newExpense: Expense = {
            id: `exp_${Date.now()}`,
            ride_id: expenseData.ride_id!,
            payer_id: expenseData.payer_id || 'user_current',
            description: expenseData.description!,
            amount: expenseData.amount!,
            currency: 'USD',
            category: expenseData.category || 'OTHER',
            split_method: expenseData.split_method || 'EQUAL',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            payer: MOCK_USERS.find(u => u.id === (expenseData.payer_id || 'user_current')),
            splits: expenseData.splits || []
        };
        MOCK_EXPENSES.push(newExpense);
        return { data: newExpense, error: null };
    }
};
