import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../../ui/AccountProvider';
import { runReview } from './engine';
import { WORLD_ORDER } from './groups/worldSkill';

const SEVERITY_LABEL = {
  good: 'On track',
  info: 'Note',
  warning: 'Do this'
} as const;

export function ReviewPage() {
  const { account } = useAccount();
  const [worldFilter, setWorldFilter] = useState('Pinchy');

  const groups = useMemo(() => (account ? runReview(account) : []), [account]);
  const worlds = WORLD_ORDER.filter((world) => groups.some((group) => group.world === world));
  const visible = groups.filter((group) => (worldFilter === 'All' ? true : group.world === worldFilter));
  const warnings = groups.reduce((sum, group) => sum + group.items.filter((item) => item.severity === 'warning').length, 0);

  if (!account) {
    return (
      <section className="panel empty-state">
        <h1>AutoReview</h1>
        <p>Load a save first, then this page grades stamps, alchemy, bribes, and the rest of the account.</p>
      </section>
    );
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">IdleOn AutoReview-style advice</p>
          <h1>Review for {account.names[0] ?? 'your account'}</h1>
          <p className="muted">
            {warnings} action items across {groups.length} groups
          </p>
        </div>
        <Link className="button ghost" to="/dashboard">
          Back to dashboard
        </Link>
      </header>

      <div className="world-tabs">
        <button className={worldFilter === 'All' ? 'active' : ''} type="button" onClick={() => setWorldFilter('All')}>
          All
        </button>
        {worlds.map((world) => (
          <button
            key={world}
            className={worldFilter === world ? 'active' : ''}
            type="button"
            onClick={() => setWorldFilter(world)}
          >
            {world}
          </button>
        ))}
      </div>

      {visible.map((group) => (
        <article key={group.id} className="panel advice-card">
          <header className="advice-head">
            <div>
              <p className="eyebrow">{group.world}</p>
              <h3>{group.title}</h3>
            </div>
            <span className="muted">{group.summary}</span>
          </header>
          <ul className="advice-list">
            {group.items.map((item) => (
              <li key={`${group.id}:${item.title}`} className={`advice-item ${item.severity}`}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <div className="advice-meta">
                  <span className="pill">{SEVERITY_LABEL[item.severity]}</span>
                  {item.current ? (
                    <span className="muted">
                      {item.current}
                      {item.goal ? ` → ${item.goal}` : ''}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
