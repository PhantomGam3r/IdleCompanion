import {
  IDLEON_FIREBASE,
  IDENTITY_TOOLKIT_PASSWORD,
  IDENTITY_TOOLKIT_REQUEST_URI,
  IDENTITY_TOOLKIT_SIGN_IN_IDP,
  SECURE_TOKEN_URL,
  TOKEN_EXPIRY_SKEW_MS
} from './idleonConfig';
import type { AuthProvider, FirebaseSession, IdentityToolkitUser } from './types';

export function buildSignInWithIdpBody(googleIdToken: string) {
  return {
    requestUri: IDENTITY_TOOLKIT_REQUEST_URI,
    postBody: `id_token=${googleIdToken}&providerId=google.com`,
    returnSecureToken: true,
    returnIdpCredential: true
  };
}

function sessionFromToolkit(user: IdentityToolkitUser, provider: AuthProvider): FirebaseSession {
  const expiresInSec = Number(user.expiresIn) || 3600;
  return {
    uid: user.localId,
    idToken: user.idToken,
    refreshToken: user.refreshToken,
    expiresAt: Date.now() + expiresInSec * 1000,
    email: user.email,
    displayName: user.displayName,
    provider
  };
}

async function readToolkitError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: { message?: string } };
    return body.error?.message || `Auth failed (${res.status})`;
  } catch {
    return `Auth failed (${res.status})`;
  }
}

export async function signInWithGoogleIdToken(googleIdToken: string): Promise<FirebaseSession> {
  const res = await fetch(IDENTITY_TOOLKIT_SIGN_IN_IDP(IDLEON_FIREBASE.apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildSignInWithIdpBody(googleIdToken))
  });
  if (!res.ok) {
    throw new Error(await readToolkitError(res));
  }
  const user = (await res.json()) as IdentityToolkitUser;
  if (!user.localId || !user.idToken || !user.refreshToken) {
    throw new Error('Firebase did not return a session.');
  }
  return sessionFromToolkit(user, 'google');
}

export async function signInWithEmailPassword(email: string, password: string): Promise<FirebaseSession> {
  const res = await fetch(IDENTITY_TOOLKIT_PASSWORD(IDLEON_FIREBASE.apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  if (!res.ok) {
    const message = await readToolkitError(res);
    if (
      message.includes('INVALID_PASSWORD') ||
      message.includes('EMAIL_NOT_FOUND') ||
      message.includes('INVALID_LOGIN_CREDENTIALS')
    ) {
      throw new Error('Username or password is incorrect.');
    }
    throw new Error(message);
  }
  const user = (await res.json()) as IdentityToolkitUser;
  return sessionFromToolkit(user, 'email');
}

export async function refreshSession(session: FirebaseSession): Promise<FirebaseSession> {
  const res = await fetch(SECURE_TOKEN_URL(IDLEON_FIREBASE.apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: session.refreshToken
    }).toString()
  });
  if (!res.ok) {
    throw new Error('Session expired. Please sign in again.');
  }
  const data = (await res.json()) as {
    id_token: string;
    refresh_token: string;
    user_id: string;
    expires_in: string;
  };
  const expiresInSec = Number(data.expires_in) || 3600;
  return {
    ...session,
    uid: data.user_id || session.uid,
    idToken: data.id_token,
    refreshToken: data.refresh_token || session.refreshToken,
    expiresAt: Date.now() + expiresInSec * 1000
  };
}

export function sessionNeedsRefresh(session: FirebaseSession, now = Date.now()): boolean {
  return session.expiresAt - TOKEN_EXPIRY_SKEW_MS <= now;
}
