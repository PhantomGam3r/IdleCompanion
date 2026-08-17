import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../AccountProvider';
import { EmailLoginPanel } from './EmailLogin';
import { GoogleLoginPanel } from './GoogleLogin';

type Tab = 'google' | 'email';

export function LoginDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { account, cancelGoogleLogin, session } = useAccount();
  const [tab, setTab] = useState<Tab>('google');

  useEffect(() => {
    if (open && (session || account?.source === 'json')) onClose();
  }, [account?.source, onClose, open, session]);

  if (!open) return null;

  const close = () => {
    cancelGoogleLogin();
    onClose();
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="modal" role="dialog" aria-labelledby="login-title" onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <div>
            <h2 id="login-title">Sign in to Idleon</h2>
            <p className="muted">Use the same credentials as your Idleon account.</p>
          </div>
          <button className="icon-button" type="button" onClick={close} aria-label="Close">
            ×
          </button>
        </header>
        <div className="tabs">
          <button className={tab === 'google' ? 'active' : ''} type="button" onClick={() => setTab('google')}>
            Google
          </button>
          <button
            className={tab === 'email' ? 'active' : ''}
            type="button"
            onClick={() => {
              cancelGoogleLogin();
              setTab('email');
            }}
          >
            Email
          </button>
        </div>
        {tab === 'google' ? <GoogleLoginPanel /> : <EmailLoginPanel onDone={onClose} />}
        <p className="muted">
          Steam/Apple saves can be pasted as JSON on the <Link to="/import">Import</Link> page.
        </p>
      </div>
    </div>
  );
}
