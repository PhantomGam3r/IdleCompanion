import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAccount } from '../AccountProvider';
import { LoginDialog } from '../login/LoginDialog';
import { NavBar } from './NavBar';

export function AppShell() {
  const { loading, error } = useAccount();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="app-shell">
      <NavBar onLogin={() => setLoginOpen(true)} />
      {error && !loginOpen ? <div className="banner warning">{error}</div> : null}
      {loading ? <div className="banner">Loading Idleon data…</div> : null}
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        Not affiliated with Lava or Legends of Idleon. Inspired by Idleon Toolbox and IdleOn AutoReview.
      </footer>
      <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
