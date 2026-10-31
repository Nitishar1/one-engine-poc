export type UserRole = 'Admin' | 'Operator' | 'Viewer';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  domain: string;
  lastLogin: string;
  timezone: string;
}

export interface LoginRequest {
  domain: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
