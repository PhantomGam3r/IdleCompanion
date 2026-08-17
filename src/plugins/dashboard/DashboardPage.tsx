import { Link } from 'react-router-dom';
import { useAccount } from '../../ui/AccountProvider';
import { SKILL_NAMES } from '../../core/parse/parseSave';

function formatAgo(ms: number | null): string {
  if (!ms) return 'Unknown';
  const delta = Date.now() - ms;
  if (delta < 0) return 'Just now';
  const hours = Math.floor(delta / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ago`;
  const minutes = Math.floor((delta % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m ago`;
  return `${Math.max(1, minutes)}m ago`;
}

export function DashboardPage() {
  const { account, session, bundle } = useAccount();

  if (!account) {
    return (
      <section className="panel empty-state">
        <h1>Dashboard</h1>
        <p>Sign in with your Idleon Google account to load a live cloudsave.</p>
      </section>
    );
  }

  const highest = [...account.characters].sort((a, b) => b.combatLevel - a.combatLevel)[0];
  const skillTotals = SKILL_NAMES.slice(1).map((skill) => ({
    skill,
    level: Math.max(...account.characters.map((c) => c.skills[skill] ?? 0), 0)
  }));

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Idleon Toolbox-style overview</p>
          <h1>Account dashboard</h1>
          <p className="muted">
            {session?.email ? `${session.email} · ` : ''}
            {account.characters.length} characters · World {account.highestWorld} ·{' '}
            last save {formatAgo(account.lastUpdatedMs)}
            {account.isStale ? ' · stale (over 24h)' : ''}
          </p>
        </div>
        <Link className="button" to="/review">
          Run AutoReview
        </Link>
      </header>

      {account.isStale ? (
        <p className="banner warning">This save is over a day old. Log into Idleon, then refresh here.</p>
      ) : null}

      <section className="stat-grid">
        <article className="stat-card">
          <span className="stat-label">Characters</span>
          <strong>{account.characters.length}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Highest combat</span>
          <strong>{highest?.combatLevel ?? 0}</strong>
          <span className="muted">{highest?.name}</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Stamp levels</span>
          <strong>{account.stampLevels}</strong>
          <span className="muted">{account.stampsCollected} collected</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Bubble levels</span>
          <strong>{account.bubbleLevels}</strong>
          <span className="muted">{account.bubbles.filter((b) => b.level > 0).length} unlocked</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Source</span>
          <strong>{account.source === 'cloud' ? 'Live cloud' : 'JSON import'}</strong>
          <span className="muted">{bundle?.source}</span>
        </article>
      </section>

      <section className="panel">
        <h2>Characters</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Lv</th>
                <th>STR</th>
                <th>AGI</th>
                <th>WIS</th>
                <th>LUK</th>
              </tr>
            </thead>
            <tbody>
              {account.characters.map((character) => (
                <tr key={character.index}>
                  <td>{character.name}</td>
                  <td>{character.className}</td>
                  <td>{character.combatLevel}</td>
                  <td>{character.stats.str}</td>
                  <td>{character.stats.agi}</td>
                  <td>{character.stats.wis}</td>
                  <td>{character.stats.luk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <h2>Family skill peaks</h2>
        <ul className="skill-list">
          {skillTotals
            .filter((row) => row.level > 0)
            .map((row) => (
              <li key={row.skill}>
                <span>{row.skill}</span>
                <strong>{row.level}</strong>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
