export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type VerificationType = 'EMAIL_OTP' | 'PHONE_OTP' | 'ID_CARD';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface College {
  id: string;
  name: string;
  email_domain: string;
  location_name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  full_name: string;
  profile_picture_url?: string;
  college_id?: string;
  student_id_card_url?: string;
  year_of_study?: number;
  gender: Gender;
  is_email_verified: boolean;
  is_id_verified: boolean;
  account_status: AccountStatus;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserVerification {
  id: string;
  user_id: string;
  type: VerificationType;
  status: VerificationStatus;
  otp_code_hash?: string;
  otp_expires_at?: string;
  proof_url?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  preferred_gender_match: 'ANY' | 'SAME_GENDER';
  preferred_transport_mode: 'ANY' | 'CAR' | 'BIKE' | 'WALK';
  search_radius_km: number;
  age_range_min: number;
  age_range_max: number;
  notification_enabled: boolean;
}
