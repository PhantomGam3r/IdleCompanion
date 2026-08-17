import { IDLEON_GOOGLE_OAUTH } from './idleonConfig';
import type { DeviceCodeResponse, GoogleTokenResponse } from './types';
import { isGoogleTokenSuccess } from './types';

const form = (entries: Record<string, string>) =>
  new URLSearchParams(entries).toString();

export async function requestDeviceCode(): Promise<DeviceCodeResponse> {
  const res = await fetch(IDLEON_GOOGLE_OAUTH.deviceCodeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form({
      client_id: IDLEON_GOOGLE_OAUTH.deviceClientId,
      scope: IDLEON_GOOGLE_OAUTH.scope
    })
  });
  if (!res.ok) {
    throw new Error(`Could not start Google device login (${res.status}).`);
  }
  const data = (await res.json()) as DeviceCodeResponse;
  if (!data.device_code || !data.user_code) {
    throw new Error('Google did not return a device login code.');
  }
  return {
    ...data,
    interval: Math.max(1, data.interval || 5),
    expires_in: data.expires_in || 1800
  };
}

export async function pollDeviceToken(deviceCode: string): Promise<GoogleTokenResponse> {
  try {
    const res = await fetch(IDLEON_GOOGLE_OAUTH.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form({
        client_id: IDLEON_GOOGLE_OAUTH.deviceClientId,
        client_secret: IDLEON_GOOGLE_OAUTH.clientSecret,
        device_code: deviceCode,
        grant_type: IDLEON_GOOGLE_OAUTH.deviceGrantType
      })
    });
    const data = (await res.json()) as GoogleTokenResponse;
    return data;
  } catch {
    return { error: 'network', error_description: 'Could not reach Google.' };
  }
}

export function messageForGoogleTokenError(error: string): string {
  switch (error) {
    case 'authorization_pending':
      return 'Waiting for you to approve the code at google.com/device.';
    case 'slow_down':
      return 'Google asked us to wait a bit longer.';
    case 'access_denied':
      return 'Google sign-in was cancelled.';
    case 'expired_token':
      return 'The login code expired. Close this dialog and try again.';
    case 'network':
      return 'Could not reach Google. Check your connection and try again.';
    default:
      return `Google sign-in failed (${error}).`;
  }
}

export function isTransientGoogleError(error: string | undefined): boolean {
  return error === 'authorization_pending' || error === 'slow_down';
}

export { isGoogleTokenSuccess };
