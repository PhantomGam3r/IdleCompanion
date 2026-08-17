import { RTDB_URL } from '../auth/idleonConfig';

export async function getRtdbValue<T = unknown>(path: string, idToken: string): Promise<T | null> {
  const url = new URL(RTDB_URL(path));
  url.searchParams.set('auth', idToken);
  const res = await fetch(url.toString());
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Could not read ${path} (${res.status}).`);
  }
  const data = (await res.json()) as T | null;
  return data ?? null;
}
