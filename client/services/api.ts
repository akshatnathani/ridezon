export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    pageSize: number;
}
