import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../../ui/AccountProvider';

export function ImportPage() {
  const { importJson } = useAccount();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const parsed = JSON.parse(text);
      importJson(parsed);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import that JSON.');
    }
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Fallback when you are not using Google login</p>
          <h1>Paste save JSON</h1>
          <p className="muted">
            Accepts Idleon Toolbox JSON (<code>data</code> + <code>charNames</code>), IdleOn Efficiency public
            profiles, or raw game JSON that includes <code>OptLacc</code> / <code>Lv0_0</code>.
          </p>
        </div>
      </header>
      <form className="panel" onSubmit={onSubmit}>
        <label htmlFor="save-json">Save JSON</label>
        <textarea
          id="save-json"
          rows={16}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder='{"data": {...}, "charNames": ["YourName"]}'
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="button" type="submit" disabled={!text.trim()}>
          Import and open dashboard
        </button>
      </form>
    </div>
  );
}
