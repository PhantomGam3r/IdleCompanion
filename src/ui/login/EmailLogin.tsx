import { useState, type FormEvent } from 'react';
import { useAccount } from '../AccountProvider';

export function EmailLoginPanel({ onDone }: { onDone: () => void }) {
  const { loginWithEmail, error } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError('');
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      onDone();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Email login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="login-pane" onSubmit={(event) => void onSubmit(event)}>
      <p>Use the same email and password as your Idleon account.</p>
      <label htmlFor="idleon-email">Email</label>
      <input
        id="idleon-email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <label htmlFor="idleon-password">Password</label>
      <input
        id="idleon-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <button className="button" type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
      {localError || error ? <p className="error">{localError || error}</p> : null}
    </form>
  );
}
