import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { FirebaseSession } from '../core/auth/types';
import {
  isGoogleTokenSuccess,
  isTransientGoogleError,
  messageForGoogleTokenError,
  pollDeviceToken,
  requestDeviceCode
} from '../core/auth/googleDevice';
import { signInWithEmailPassword, signInWithGoogleIdToken } from '../core/auth/identityToolkit';
import {
  clearStoredSession,
  ensureFreshSession,
  restoreSession,
  writeStoredSession
} from '../core/auth/session';
import { fromImportedJson, loadCloudSave, type RawSaveBundle } from '../core/idleon/loadSave';
import { parseSave } from '../core/parse/parseSave';
import type { ParsedAccount } from '../core/parse/types';
import type { DeviceCodeResponse } from '../core/auth/types';

type AccountContextValue = {
  session: FirebaseSession | null;
  bundle: RawSaveBundle | null;
  account: ParsedAccount | null;
  loading: boolean;
  error: string;
  googleDevice: DeviceCodeResponse | null;
  waitingForGoogle: boolean;
  startGoogleLogin: () => Promise<void>;
  cancelGoogleLogin: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  importJson: (input: unknown) => void;
  refreshCloud: () => Promise<void>;
  logout: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccount(): AccountContextValue {
  const value = useContext(AccountContext);
  if (!value) {
    throw new Error('useAccount must be used inside AccountProvider');
  }
  return value;
}

async function hydrateFromSession(session: FirebaseSession): Promise<{ session: FirebaseSession; bundle: RawSaveBundle; account: ParsedAccount }> {
  const fresh = await ensureFreshSession(session);
  const bundle = await loadCloudSave(fresh.uid, fresh.idToken);
  return { session: fresh, bundle, account: parseSave(bundle) };
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [bundle, setBundle] = useState<RawSaveBundle | null>(null);
  const [account, setAccount] = useState<ParsedAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleDevice, setGoogleDevice] = useState<DeviceCodeResponse | null>(null);
  const [waitingForGoogle, setWaitingForGoogle] = useState(false);
  const pollStop = useRef(false);
  const pollGeneration = useRef(0);

  const applyCloud = useCallback((nextSession: FirebaseSession, nextBundle: RawSaveBundle) => {
    writeStoredSession(nextSession);
    setSession(nextSession);
    setBundle(nextBundle);
    setAccount(parseSave(nextBundle));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await restoreSession();
      if (!stored || cancelled) {
        setLoading(false);
        return;
      }
      try {
        const hydrated = await hydrateFromSession(stored);
        if (cancelled) return;
        applyCloud(hydrated.session, hydrated.bundle);
      } catch (err) {
        if (!cancelled) {
          clearStoredSession();
          setError(err instanceof Error ? err.message : 'Could not restore the previous session.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyCloud]);

  const startGoogleLogin = useCallback(async () => {
    setError('');
    pollStop.current = false;
    const generation = ++pollGeneration.current;
    const device = await requestDeviceCode();
    if (pollStop.current || pollGeneration.current !== generation) return;
    setGoogleDevice(device);
    setWaitingForGoogle(true);
    const expiresAt = Date.now() + device.expires_in * 1000;
    let delayMs = Math.max(1000, device.interval * 1000);

    const tick = async () => {
      if (pollStop.current || pollGeneration.current !== generation) return;
      if (Date.now() > expiresAt) {
        setWaitingForGoogle(false);
        setError('The login code expired. Close this dialog and try again.');
        return;
      }
      const token = await pollDeviceToken(device.device_code);
      if (pollStop.current || pollGeneration.current !== generation) return;
      if (isGoogleTokenSuccess(token)) {
        setLoading(true);
        try {
          const nextSession = await signInWithGoogleIdToken(token.id_token);
          const nextBundle = await loadCloudSave(nextSession.uid, nextSession.idToken);
          applyCloud(nextSession, nextBundle);
          setWaitingForGoogle(false);
          setGoogleDevice(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Signed in, but the cloudsave could not be loaded.');
          setWaitingForGoogle(false);
        } finally {
          setLoading(false);
        }
        return;
      }
      const errCode = 'error' in token ? token.error : 'unknown';
      if (isTransientGoogleError(errCode)) {
        if (errCode === 'slow_down') delayMs += 2000;
        window.setTimeout(() => {
          void tick();
        }, delayMs);
        return;
      }
      setWaitingForGoogle(false);
      setError(messageForGoogleTokenError(errCode));
    };

    window.setTimeout(() => {
      void tick();
    }, 1000);
  }, [applyCloud]);

  const cancelGoogleLogin = useCallback(() => {
    pollStop.current = true;
    pollGeneration.current += 1;
    setWaitingForGoogle(false);
    setGoogleDevice(null);
  }, []);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setError('');
      setLoading(true);
      try {
        const nextSession = await signInWithEmailPassword(email, password);
        const nextBundle = await loadCloudSave(nextSession.uid, nextSession.idToken);
        applyCloud(nextSession, nextBundle);
      } finally {
        setLoading(false);
      }
    },
    [applyCloud]
  );

  const importJson = useCallback((input: unknown) => {
    const nextBundle = fromImportedJson(input);
    setSession(null);
    setBundle(nextBundle);
    setAccount(parseSave(nextBundle));
    setError('');
  }, []);

  const refreshCloud = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      const hydrated = await hydrateFromSession(session);
      applyCloud(hydrated.session, hydrated.bundle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refresh failed.');
    } finally {
      setLoading(false);
    }
  }, [applyCloud, session]);

  const logout = useCallback(() => {
    pollStop.current = true;
    clearStoredSession();
    setSession(null);
    setBundle(null);
    setAccount(null);
    setGoogleDevice(null);
    setWaitingForGoogle(false);
    setError('');
  }, []);

  useEffect(() => {
    if (!session) return undefined;
    const id = window.setInterval(() => {
      void refreshCloud();
    }, 45_000);
    return () => window.clearInterval(id);
  }, [refreshCloud, session]);

  const value = useMemo<AccountContextValue>(
    () => ({
      session,
      bundle,
      account,
      loading,
      error,
      googleDevice,
      waitingForGoogle,
      startGoogleLogin,
      cancelGoogleLogin,
      loginWithEmail,
      importJson,
      refreshCloud,
      logout
    }),
    [
      account,
      bundle,
      cancelGoogleLogin,
      error,
      googleDevice,
      importJson,
      loading,
      loginWithEmail,
      logout,
      refreshCloud,
      session,
      startGoogleLogin,
      waitingForGoogle
    ]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}
