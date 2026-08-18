import { Link } from 'react-router-dom';
import { useAccount } from '../../ui/AccountProvider';
import { formatCount } from '../../core/parse/helpers';
import { SKILL_NAMES } from '../../core/parse/parseSave';
import { GameIcon } from '../../ui/icons/GameIcon';
import { skillIconPath, WORLD_ICONS } from '../../ui/icons/gameIcons';
import { collectAccountAlerts, groupAlertsByWorld } from './accountAlerts';
import { collectCharacterAlerts, groupCharacterAlerts } from './characterAlerts';
import { collectDashboardTimers, formatTimerRemaining, groupDashboardTimers } from './dashboardTimers';

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

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  detail?: string;
};

function StatCard({ icon, label, value, detail }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-head">
        <GameIcon path={icon} alt="" size={28} />
        <span className="stat-label">{label}</span>
      </div>
      <strong>{value}</strong>
      {detail ? <span className="muted">{detail}</span> : null}
    </article>
  );
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
  const accountAlerts = collectAccountAlerts(account);
  const alertGroups = groupAlertsByWorld(accountAlerts);
  const characterAlerts = collectCharacterAlerts(account);
  const charAlertGroups = groupCharacterAlerts(characterAlerts);
  const dashboardTimers = collectDashboardTimers(account);
  const timerGroups = groupDashboardTimers(dashboardTimers);

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

      {alertGroups.length > 0 ? (
        <section className="panel">
          <h2 className="panel-title-with-icon">
            <GameIcon path="etc/TasksStar" alt="" size={24} />
            Account alerts
            <span className="muted"> · {accountAlerts.length}</span>
          </h2>
          <div className="alert-worlds">
            {alertGroups.map((group) => (
              <div key={group.world} className="alert-world">
                <h3 className="alert-world-label">
                  {WORLD_ICONS[group.world] ? <GameIcon path={WORLD_ICONS[group.world]} alt="" size={20} /> : null}
                  {group.world}
                </h3>
                <ul className="alert-chip-list">
                  {group.items.map((item) => (
                    <li key={item.id} className="alert-chip">
                      <GameIcon path={item.icon} alt="" size={28} />
                      <div>
                        <strong>{item.title}</strong>
                        {item.detail ? <p>{item.detail}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2 className="panel-title-with-icon">
            <GameIcon path="etc/TasksStar" alt="" size={24} />
            Account alerts
          </h2>
          <p className="muted">There are no account alerts to display.</p>
        </section>
      )}

      {charAlertGroups.length > 0 ? (
        <section className="panel">
          <h2 className="panel-title-with-icon">
            <GameIcon path="etc/Character" alt="" size={24} />
            Character alerts
            <span className="muted"> · {characterAlerts.length}</span>
          </h2>
          <div className="alert-worlds">
            {charAlertGroups.map((group) => (
              <div key={group.characterIndex} className="alert-world">
                <h3 className="alert-world-label">
                  <GameIcon path={`data/ClassIcons${group.classId}`} alt="" size={20} />
                  {group.characterName}
                </h3>
                <ul className="alert-chip-list">
                  {group.items.map((item) => (
                    <li key={item.id} className="alert-chip">
                      <GameIcon path={item.icon} alt="" size={28} />
                      <div>
                        <strong>{item.title}</strong>
                        {item.detail ? <p>{item.detail}</p> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel">
          <h2 className="panel-title-with-icon">
            <GameIcon path="etc/Character" alt="" size={24} />
            Character alerts
          </h2>
          <p className="muted">There are no character alerts to display.</p>
        </section>
      )}

      {timerGroups.length > 0 ? (
        <section className="panel">
          <h2 className="panel-title-with-icon">
            <GameIcon path="data/StatusExp" alt="" size={24} />
            Timers
            <span className="muted"> · {dashboardTimers.length}</span>
          </h2>
          <div className="alert-worlds">
            {timerGroups.map((group) => (
              <div key={group.group} className="alert-world">
                <h3 className="alert-world-label">
                  {WORLD_ICONS[group.group] ? <GameIcon path={WORLD_ICONS[group.group]} alt="" size={20} /> : null}
                  {group.group}
                </h3>
                <ul className="alert-chip-list">
                  {group.items.map((item) => (
                    <li key={item.id} className={`alert-chip${item.ready ? ' alert-chip-ready' : ''}`}>
                      <GameIcon path={item.icon} alt="" size={28} />
                      <div>
                        <strong>{item.title}</strong>
                        <p>
                          {formatTimerRemaining(item.readyAtMs)}
                          {item.detail ? ` · ${item.detail}` : ''}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="stat-grid">
        <StatCard icon="etc/Character" label="Characters" value={account.characters.length} />
        <StatCard
          icon="data/ClassIcons41"
          label="Highest combat"
          value={highest?.combatLevel ?? 0}
          detail={highest?.name}
        />
        <StatCard
          icon="data/StampA34"
          label="Stamp levels"
          value={account.stampLevels}
          detail={`${account.stampsCollected} collected`}
        />
        <StatCard
          icon="data/aBrewOptionA0"
          label="Bubbles / vials"
          value={account.bubbleLevels}
          detail={`${account.vialsUnlocked} vials`}
        />
        <StatCard
          icon="data/BribeW"
          label="Bribes"
          value={account.bribesPurchased}
          detail={`${account.bribes.filter((b) => b.status === 0).length} available`}
        />
        <StatCard
          icon="data/EquipmentStatues29"
          label="Statues"
          value={account.statueLevels}
          detail={`${account.statues.filter((s) => s.level > 0).length} deposited`}
        />
        <StatCard icon="data/2CardsA0" label="Cards" value={account.cardsFound} />
        <StatCard
          icon="data/DeliveryBox"
          label="Post Office"
          value={formatCount(account.postOfficeBoxesEarned)}
          detail="boxes earned"
        />
        <StatCard
          icon="data/ConTower2"
          label="Death Note"
          value={account.deathNote.mapsWithKills}
          detail={account.deathNote.lowestSkull}
        />
        <StatCard
          icon="data/ConTower7"
          label="Buildings"
          value={account.buildingsUnlocked}
          detail={`${account.prayersUnlocked} prayers`}
        />
        <StatCard
          icon="data/ClassIcons51"
          label="Meals"
          value={account.mealsUnlocked}
          detail={`${account.kitchensOwned} kitchens`}
        />
        <StatCard
          icon="data/Mface75"
          label="Rift"
          value={account.riftLevel}
          detail={`${account.breedingPets} pets`}
        />
        <StatCard
          icon="data/ClassIcons54"
          label="Sailing"
          value={account.sailingArtifacts}
          detail={`${account.divinityGods} gods`}
        />
        <StatCard
          icon="etc/Slab"
          label="Slab / vault"
          value={account.slabItems}
          detail={`${account.vaultLevels} vault lv`}
        />
        <StatCard
          icon="data/Island1"
          label="Islands"
          value={account.islandsUnlocked}
          detail={`${account.obolsOwned} obols`}
        />
        <StatCard
          icon="data/ClassIcons57"
          label="Farming"
          value={account.farmCrops}
          detail={`${account.farmPlots} plots`}
        />
        <StatCard
          icon="data/ClassIcons58"
          label="Sneaking / summon"
          value={account.sneakingJadeUpgrades}
          detail={`${account.summonWins} wins`}
        />
        <StatCard
          icon="data/Quest90"
          label="Caverns"
          value={account.cavernsUnlocked}
          detail={`${account.coralUnlocked} corals`}
        />
        <StatCard
          icon="data/ClassIcons49"
          label="Cog board"
          value={account.cogsPlaced}
          detail={`${account.flagsComplete} flags`}
        />
        <StatCard
          icon="data/GrimoireUpg18"
          label="Master classes"
          value={account.grimoireLevels}
          detail={`${account.compassLevels} compass`}
        />
        <StatCard
          icon="data/ClassIcons61"
          label="Research"
          value={account.researchCells}
          detail={`${account.mineheadOpponents} minehead`}
        />
        <StatCard
          icon="data/TournyRank2"
          label="Companions"
          value={account.companionDataPresent ? account.companionsOwned : '—'}
          detail={account.tomeBluePages || account.tomeRedPages ? 'tome pages' : 'no extra tome pages'}
        />
        <StatCard
          icon="data/Sushi6"
          label="Sushi / Button"
          value={account.sushiUnique}
          detail={`${account.buttonPresses} presses`}
        />
        <StatCard
          icon="data/GalleryBell"
          label="Source"
          value={account.source === 'cloud' ? 'Live cloud' : 'JSON import'}
          detail={bundle?.source}
        />
      </section>

      <section className="panel">
        <h2 className="panel-title-with-icon">
          <GameIcon path="etc/Character" alt="" size={24} />
          Characters
        </h2>
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
                <th>
                  <span className="table-icon-label">
                    <GameIcon path="data/DeliveryBox" alt="" size={18} />
                    PO
                  </span>
                </th>
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
        <h2 className="panel-title-with-icon">
          <GameIcon path="data/StatusExp" alt="" size={24} />
          Family skill peaks
        </h2>
        <ul className="skill-list">
          {skillTotals
            .filter((row) => row.level > 0)
            .map((row) => (
              <li key={row.skill}>
                <span className="skill-list-label">
                  <GameIcon path={skillIconPath(row.skill)} alt="" size={24} />
                  {row.skill}
                </span>
                <strong>{row.level}</strong>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}
