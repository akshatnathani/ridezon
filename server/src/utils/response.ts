import { IApiResponse, IPaginatedResponse, IPaginationMeta } from '../types';

/**
 * Creates a standardized success response
 */
export const successResponse = <T>(
  message: string,
  data?: T
): IApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Creates a standardized error response
 */
export const errorResponse = (
  message: string,
  error?: string,
  errors?: Record<string, string[]>
): IApiResponse => {
  return {
    success: false,
    message,
    error,
    errors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Creates a standardized paginated response
 */
export const paginatedResponse = <T>(
  message: string,
  data: T,
  meta: IPaginationMeta
): IPaginatedResponse<T> => {
  return {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
): IPaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
  };
};
