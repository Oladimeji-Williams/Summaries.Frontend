export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
}

export interface AuthResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAtUtc: string;
  readonly refreshTokenExpiresAtUtc: string;
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
}

export interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly createdAtUtc: string;
  readonly avatarUrl: string | null;
}

export interface AuthResult {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAtUtc: string;
  readonly refreshTokenExpiresAtUtc: string;
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
  readonly roles: readonly string[];
  readonly avatarUrl: string | null;
}

export interface ForgotPasswordRequest {
  readonly email: string;
}

export interface ForgotPasswordResult {
  readonly resetToken: string | null;
}

export interface ResetPasswordRequest {
  readonly email: string;
  readonly token: string;
  readonly newPassword: string;
}

export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
}

export interface UpdateProfileRequest {
  readonly firstName: string;
  readonly lastName: string;
}
