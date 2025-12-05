export type LoginFormValues = {
  username: string;
  password: string;
  otp_code?: string;
};

export type RegistrationFormValues = {
  username: string;
  email: string;
  password: string;
  password2: string;
};

export type TwoFAStatus = {
  is_enabled: boolean;
  has_secret: boolean;
  otpauth_url: string | null;
  secret: string | null;
};

export type ToggleTwoFARequest = {
  enable: boolean;
  otp_code: string;
};

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_2fa_enabled: boolean;
}