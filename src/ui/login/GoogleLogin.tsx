import { useEffect, useState } from 'react';
import { IDLEON_GOOGLE_OAUTH } from '../../core/auth/idleonConfig';
import { useAccount } from '../AccountProvider';

export function GoogleLoginPanel() {
  const { googleDevice, waitingForGoogle, startGoogleLogin, cancelGoogleLogin, error } = useAccount();
  const [copyFailed, setCopyFailed] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    void startGoogleLogin();
    return () => cancelGoogleLogin();
  }, [cancelGoogleLogin, startGoogleLogin]);

  const copyAndOpen = async () => {
    if (!googleDevice) return;
    try {
      await navigator.clipboard.writeText(googleDevice.user_code);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
    window.open(IDLEON_GOOGLE_OAUTH.deviceVerificationUrl, '_blank', 'noopener,noreferrer');
    setOpened(true);
  };

  return (
    <div className="login-pane">
      <p>
        Use the <strong>same Google account</strong> as Legends of Idleon. GitHub Pages cannot use a Google popup
        against the game&apos;s Firebase project, so this uses Google&apos;s device login — the same flow as Idleon
        Toolbox.
      </p>
      <p>
        Open{' '}
        <a href={IDLEON_GOOGLE_OAUTH.deviceVerificationUrl} target="_blank" rel="noreferrer" onClick={() => setOpened(true)}>
          google.com/device
        </a>{' '}
        and enter this code:
      </p>
      <p className="device-code">{googleDevice?.user_code ?? 'Loading code…'}</p>
      <button className="button" type="button" onClick={() => void copyAndOpen()} disabled={!googleDevice}>
        Copy code and open Google
      </button>
      {copyFailed ? <p className="muted">Could not copy automatically — copy the code above.</p> : null}
      {opened && waitingForGoogle ? <p className="muted">Waiting for you to approve the code…</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
