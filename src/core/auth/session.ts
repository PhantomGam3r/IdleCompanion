import { SESSION_STORAGE_KEY } from './idleonConfig';
import { refreshSession, sessionNeedsRefresh } from './identityToolkit';
import type { FirebaseSession } from './types';

export function readStoredSession(): FirebaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FirebaseSession;
    if (!parsed?.uid || !parsed?.idToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: FirebaseSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function restoreSession(): Promise<FirebaseSession | null> {
  const stored = readStoredSession();
  if (!stored) return null;
  try {
    if (sessionNeedsRefresh(stored)) {
      const refreshed = await refreshSession(stored);
      writeStoredSession(refreshed);
      return refreshed;
    }
    return stored;
  } catch {
    clearStoredSession();
    return null;
  }
}

export async function ensureFreshSession(session: FirebaseSession): Promise<FirebaseSession> {
  if (!sessionNeedsRefresh(session)) return session;
  const refreshed = await refreshSession(session);
  writeStoredSession(refreshed);
  return refreshed;
}
