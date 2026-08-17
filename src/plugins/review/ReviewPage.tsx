import { Link } from 'react-router-dom';
import { useAccount } from '../../ui/AccountProvider';
import { runReview } from './engine';

const SEVERITY_LABEL = {
  good: 'On track',
  info: 'Note',
  warning: 'Do this'
} as const;

export function ReviewPage() {
  const { account } = useAccount();

  if (!account) {
    return (
      <section className="panel empty-state">
        <h1>AutoReview</h1>
        <p>Load a save first, then this page grades stamps, alchemy, and account basics.</p>
      </section>
    );
  }

  const groups = runReview(account);
  const worlds = [...new Set(groups.map((group) => group.world))];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">IdleOn AutoReview-style advice</p>
          <h1>Review for {account.names[0] ?? 'your account'}</h1>
          <p className="muted">
            {groups.reduce((sum, group) => sum + group.items.filter((i) => i.severity === 'warning').length, 0)} action
            items across {groups.length} groups
          </p>
        </div>
        <Link className="button ghost" to="/dashboard">
          Back to dashboard
        </Link>
      </header>

      {worlds.map((world) => (
        <section key={world} className="world-block">
          <h2>{world}</h2>
          {groups
            .filter((group) => group.world === world)
            .map((group) => (
              <article key={group.id} className="panel advice-card">
                <header className="advice-head">
                  <h3>{group.title}</h3>
                  <span className="muted">{group.summary}</span>
                </header>
                <ul className="advice-list">
                  {group.items.map((item) => (
                    <li key={item.title} className={`advice-item ${item.severity}`}>
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.detail}</p>
                      </div>
                      <div className="advice-meta">
                        <span className="pill">{SEVERITY_LABEL[item.severity]}</span>
                        {item.current ? <span className="muted">{item.current}{item.goal ? ` → ${item.goal}` : ''}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
        </section>
      ))}
    </div>
  );
}
