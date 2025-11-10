import { Request } from 'express';

// ==================== Enums ====================

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'reset_password',
  VERIFY_EMAIL = 'verify_email',
}

// ==================== User Types ====================

export interface IUser {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  auth_provider: AuthProvider;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  profile_image_url?: string;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  auth_provider?: AuthProvider;
}

export interface IUserUpdate {
  full_name?: string;
  phone_number?: string;
  profile_image_url?: string;
}

export interface IUserSafe {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  profile_image_url?: string;
  last_login_at?: Date;
  created_at: Date;
}

// ==================== Auth Types ====================

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: TokenType;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
}

export interface IChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface IResetPasswordRequest {
  token: string;
  new_password: string;
}

// ==================== Session Types ====================

export interface ISession {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  device_info?: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
}

// ==================== API Response Types ====================

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T = any> extends IApiResponse<T> {
  meta: IPaginationMeta;
}

// ==================== Error Types ====================

export interface IAppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class AppError extends Error implements IAppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ==================== Request Types ====================

export interface IAuthRequest extends Request {
  user?: IUserSafe;
  userId?: string;
}

export interface IRequestQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

// ==================== Database Types ====================

export interface IDatabaseConfig {
  url: string;
  anonKey: string;
}

export interface IQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// ==================== Environment Types ====================

export interface IEnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  
  // Database
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  
  // JWT
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: string;
  JWT_REFRESH_EXPIRY: string;
  
  // Security
  BCRYPT_ROUNDS: number;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // CORS
  CORS_ORIGIN: string;
  
  // Email (for future use)
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

// ==================== Service Response Types ====================

export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}
