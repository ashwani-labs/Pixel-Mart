export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  loyaltyPoints: number;
  referralCode: string | null;
}

export interface AdminCustomer {
  id: string;
  email: string;
  name: string;
  roles: string[];
  loyaltyPoints: number;
  referralCode: string | null;
  orderCount: number;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  referralCode?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ApiErrorBody {
  status: number;
  error: string;
  message: string;
  path?: string;
  details?: string[];
}
