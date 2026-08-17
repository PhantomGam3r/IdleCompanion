import { Link } from 'react-router-dom';
import { useAccount } from '../../ui/AccountProvider';
import { formatCount } from '../../core/parse/helpers';
import { SKILL_NAMES } from '../../core/parse/parseSave';
import { runReview } from '../review/engine';

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
  const alerts = runReview(account)
    .find((group) => group.id === 'pinchy')
    ?.items.filter((item) => item.severity === 'warning') ?? [];

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
        <div className="hero-actions">
          <Link className="button ghost" to="/characters">
            Compare characters
          </Link>
          <Link className="button" to="/review">
            Run AutoReview
          </Link>
        </div>
      </header>

      {account.isStale ? (
        <p className="banner warning">This save is over a day old. Log into Idleon, then refresh here.</p>
      ) : null}

      {alerts.length > 0 ? (
        <section className="panel">
          <h2>Alerts</h2>
          <ul className="advice-list">
            {alerts.slice(0, 5).map((item) => (
              <li key={item.title} className="advice-item warning">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
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
          <span className="stat-label">Bubbles / vials</span>
          <strong>{account.bubbleLevels}</strong>
          <span className="muted">{account.vialsUnlocked} vials</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Bribes</span>
          <strong>{account.bribesPurchased}</strong>
          <span className="muted">{account.bribes.filter((b) => b.status === 0).length} available</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Statues</span>
          <strong>{account.statueLevels}</strong>
          <span className="muted">{account.statues.filter((s) => s.level > 0).length} deposited</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Cards</span>
          <strong>{account.cardsFound}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Post Office</span>
          <strong>{formatCount(account.postOfficeBoxesEarned)}</strong>
          <span className="muted">boxes earned</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Death Note</span>
          <strong>{account.deathNote.mapsWithKills}</strong>
          <span className="muted">{account.deathNote.lowestSkull}</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Buildings</span>
          <strong>{account.buildingsUnlocked}</strong>
          <span className="muted">{account.prayersUnlocked} prayers</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Meals</span>
          <strong>{account.mealsUnlocked}</strong>
          <span className="muted">{account.kitchensOwned} kitchens</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Rift</span>
          <strong>{account.riftLevel}</strong>
          <span className="muted">{account.breedingPets} pets</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Sailing</span>
          <strong>{account.sailingArtifacts}</strong>
          <span className="muted">{account.divinityGods} gods</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Slab / vault</span>
          <strong>{account.slabItems}</strong>
          <span className="muted">{account.vaultLevels} vault lv</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Islands</span>
          <strong>{account.islandsUnlocked}</strong>
          <span className="muted">{account.obolsOwned} obols</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Farming</span>
          <strong>{account.farmCrops}</strong>
          <span className="muted">{account.farmPlots} plots</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Sneaking / summon</span>
          <strong>{account.sneakingJadeUpgrades}</strong>
          <span className="muted">{account.summonWins} wins</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Caverns</span>
          <strong>{account.cavernsUnlocked}</strong>
          <span className="muted">{account.coralUnlocked} corals</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Cog board</span>
          <strong>{account.cogsPlaced}</strong>
          <span className="muted">{account.flagsComplete} flags</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Master classes</span>
          <strong>{account.grimoireLevels}</strong>
          <span className="muted">{account.compassLevels} compass</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Research</span>
          <strong>{account.researchCells}</strong>
          <span className="muted">{account.mineheadOpponents} minehead</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Companions</span>
          <strong>{account.companionDataPresent ? account.companionsOwned : '—'}</strong>
          <span className="muted">{account.tomeBluePages || account.tomeRedPages ? 'tome pages' : 'no extra tome pages'}</span>
        </article>
        <article className="stat-card">
          <span className="stat-label">Sushi / Button</span>
          <strong>{account.sushiUnique}</strong>
          <span className="muted">{account.buttonPresses} presses</span>
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
                <th>PO</th>
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
                  <td>{formatCount(character.postOfficeInvested)}</td>
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
