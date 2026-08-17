import { describe, expect, it } from 'vitest';
import {
  isTransientGoogleError,
  messageForGoogleTokenError,
  isGoogleTokenSuccess
} from './googleDevice';
import type { GoogleTokenResponse } from './types';

describe('Google device-flow polling states', () => {
  it('treats authorization_pending and slow_down as wait-and-retry', () => {
    expect(isTransientGoogleError('authorization_pending')).toBe(true);
    expect(isTransientGoogleError('slow_down')).toBe(true);
    expect(isTransientGoogleError('expired_token')).toBe(false);
    expect(isTransientGoogleError('access_denied')).toBe(false);
  });

  it('maps Google errors to login copy', () => {
    expect(messageForGoogleTokenError('authorization_pending')).toMatch(/google.com\/device/i);
    expect(messageForGoogleTokenError('access_denied')).toMatch(/cancelled/i);
    expect(messageForGoogleTokenError('expired_token')).toMatch(/expired/i);
    expect(messageForGoogleTokenError('network')).toMatch(/reach Google/i);
  });

  it('detects a completed token payload', () => {
    const pending: GoogleTokenResponse = { error: 'authorization_pending' };
    const success: GoogleTokenResponse = { id_token: 'header.payload.sig' };
    expect(isGoogleTokenSuccess(pending)).toBe(false);
    expect(isGoogleTokenSuccess(success)).toBe(true);
  });
});
