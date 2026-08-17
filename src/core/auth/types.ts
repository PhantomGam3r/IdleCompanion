export type AuthProvider = 'google' | 'email';

export type FirebaseSession = {
  uid: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  email?: string;
  displayName?: string;
  provider: AuthProvider;
};

export type DeviceCodeResponse = {
  device_code: string;
  user_code: string;
  verification_url?: string;
  expires_in: number;
  interval: number;
};

export type GoogleTokenSuccess = {
  id_token: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
};

export type GoogleTokenPending = {
  error: 'authorization_pending' | 'slow_down' | 'access_denied' | 'expired_token' | string;
  error_description?: string;
};

export type GoogleTokenResponse = GoogleTokenSuccess | GoogleTokenPending;

export function isGoogleTokenSuccess(value: GoogleTokenResponse): value is GoogleTokenSuccess {
  return 'id_token' in value && typeof value.id_token === 'string';
}

export type IdentityToolkitUser = {
  localId: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  email?: string;
  displayName?: string;
};
