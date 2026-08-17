import { NavLink } from 'react-router-dom';
import { getPlugins } from '../../core/plugins/registry';
import { useAccount } from '../AccountProvider';

export function NavBar({ onLogin }: { onLogin: () => void }) {
  const { account, session, logout, loading, refreshCloud } = useAccount();
  const plugins = getPlugins().filter((plugin) => plugin.nav);

  return (
    <header className="nav">
      <NavLink to="/" className="brand">
        IdleCompanion
      </NavLink>
      <nav>
        {plugins.map((plugin) => (
          <NavLink key={plugin.id} to={plugin.nav!.path}>
            {plugin.nav!.label}
          </NavLink>
        ))}
      </nav>
      <div className="nav-end">
        {session ? (
          <>
            <button className="button ghost" type="button" onClick={() => void refreshCloud()} disabled={loading}>
              Refresh
            </button>
            <span className="muted nav-user">{session.email ?? session.uid.slice(0, 8)}</span>
            <button className="button ghost" type="button" onClick={logout}>
              Sign out
            </button>
          </>
        ) : account ? (
          <>
            <span className="muted nav-user">JSON import</span>
            <button className="button ghost" type="button" onClick={logout}>
              Clear
            </button>
          </>
        ) : (
          <button className="button" type="button" onClick={onLogin}>
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
}
