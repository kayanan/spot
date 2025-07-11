export interface ChangePasswordRequest {
  email: string;
  password: string;
  otp: string;
}

export interface ChangePasswordLoggedInRequest {
  currentPassword: string;
  newPassword: string;
}
