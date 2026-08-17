import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from './AccountProvider';
import { LoginDialog } from './login/LoginDialog';

export function HomePage() {
  const { account, session } = useAccount();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="hero">
      <p className="eyebrow">Toolbox + AutoReview, one static app</p>
      <h1>IdleCompanion</h1>
      <p className="lede">
        Sign in with the Google account you use in Legends of Idleon. IdleCompanion loads your live cloudsave, shows an
        account dashboard, and runs AutoReview-style advice — all hosted on GitHub Pages.
      </p>
      <div className="hero-actions">
        {account ? (
          <>
            <Link className="button" to="/dashboard">
              Open dashboard
            </Link>
            <Link className="button ghost" to="/review">
              Run AutoReview
            </Link>
          </>
        ) : (
          <>
            <button className="button" type="button" onClick={() => setLoginOpen(true)}>
              Sign in with Google
            </button>
            <Link className="button ghost" to="/import">
              Paste JSON instead
            </Link>
          </>
        )}
      </div>
      <ul className="feature-grid">
        <li>
          <h2>Game login</h2>
          <p>Google device flow talks to Lava&apos;s <code>idlemmo</code> Firebase, so it works on github.io.</p>
        </li>
        <li>
          <h2>Dashboard</h2>
          <p>Characters, skills, stamps, and bubbles from the live save{session ? ` (${session.email ?? 'signed in'})` : ''}.</p>
        </li>
        <li>
          <h2>AutoReview</h2>
          <p>Advice groups are plugins — add a file under <code>src/plugins/review/groups</code> to extend them.</p>
        </li>
      </ul>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
