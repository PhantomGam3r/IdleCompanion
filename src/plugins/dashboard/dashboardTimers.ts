import { CONSTRUCTION_BUILDINGS } from '../../core/parse/catalogs';
import { asIndexedNumbers, toList } from '../../core/parse/helpers';
import { LavaRand } from '../../core/parse/lavaRand';
import type { DashboardTimer, ParsedAccount } from '../../core/parse/types';

const COMPANION_CLAIM_MS = 594e6;
const MINI_BOSS_CAPS: Record<string, number> = { mini3b: 10, mini4b: 8, mini5a: 6, mini6a: 6 };
const VILLAGER_NAMES = ['Explore', 'Engineer', 'Bonuses', 'Measure', 'Study'];
const RANDOM_EVENT_NAMES = ['Meteorite', 'Mega Grumblo', 'Glacial Guild', 'Snake Swarm', 'Angry Frogs'];

function timer(
  group: string,
  id: string,
  title: string,
  icon: string,
  readyAtMs: number | null,
  detail?: string
): DashboardTimer {
  const ready = readyAtMs != null && readyAtMs <= Date.now();
  return { group, id, title, icon, readyAtMs, ready, detail };
}

export function formatTimerRemaining(readyAtMs: number | null, now = Date.now()): string {
  if (readyAtMs == null) return 'Waiting';
  if (readyAtMs <= now) return 'Ready';
  const sec = Math.max(0, Math.floor((readyAtMs - now) / 1000));
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  if (days > 365) return 'A long time';
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

function thursdayAnchorMs(nowMs: number): number {
  const date = new Date(nowMs);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const day = new Date(start).getDay();
  const sinceThursday = (day + 7 - 4) % 7;
  const thursday = start - sinceThursday * 86400_000;
  return thursday - new Date(thursday).getTimezoneOffset() * 60_000;
}

function happyHourTimes(hours: number[], nowMs: number): number[] {
  const anchorSec = Math.round(thursdayAnchorMs(nowMs) / 1000);
  const upcoming = hours
    .map((offset) => (offset + anchorSec - 3600) * 1000)
    .filter((time) => time > nowMs);
  if (upcoming.length > 0) return upcoming;
  const nextThursday = thursdayAnchorMs(nowMs) + 7 * 86400_000;
  const nextAnchor = Math.round(nextThursday / 1000);
  return hours.map((offset) => (offset + nextAnchor - 3600) * 1000);
}

function eventType(roll: number): number {
  if (roll < 0.045) return 0;
  if (roll < 0.087) return 1;
  if (roll < 0.129) return 2;
  if (roll < 0.171) return 3;
  if (roll < 0.213) return 4;
  return -1;
}

function nextRandomEventMs(globalTimeSec: number, randEventHr: number, nowMs: number): number | null {
  const seed = Math.round(Math.floor(globalTimeSec / 3600));
  for (let offset = 0; offset < 100; offset += 1) {
    const actualSeed = seed + offset + randEventHr;
    const type = eventType(new LavaRand(actualSeed).rand());
    if (type < 0) continue;
    const at = (seed + offset) * 3600 * 1000;
    if (at + 3600_000 <= nowMs) continue;
    return at;
  }
  return null;
}

function daysTillNextMini(id: 'mini3b' | 'mini4b' | 'mini5a' | 'mini6a', daysSince: number, current: number): number {
  const cap = MINI_BOSS_CAPS[id] ?? 6;
  if (current >= cap) return 0;
  for (let add = 1; add <= 40; add += 1) {
    const wait = daysSince + add < 3 ? 3 : daysSince + add;
    const next =
      id === 'mini3b'
        ? Math.min(10, Math.floor(Math.pow(wait - 3, 0.55)))
        : Math.min(id === 'mini4b' ? 8 : 6, Math.floor(Math.pow(wait - 3, 0.5)));
    if (next > current) return add;
  }
  return 1;
}

function weekResetMs(globalTimeSec: number, offset: number, nowMs: number): number {
  const left = 604800 - (globalTimeSec + offset - 604800 * Math.floor((globalTimeSec + offset) / 604800));
  return nowMs + left * 1000;
}

export function collectDashboardTimers(account: ParsedAccount): DashboardTimer[] {
  const { ops } = account;
  const timers: DashboardTimer[] = [];
  const world = account.highestWorld;
  const now = account.lastUpdatedMs ?? Date.now();
  const global = ops.globalTimeSec;
  const data = account.raw;

  timers.push(timer('General', 'daily', 'Daily reset', 'etc/TasksDaily', now + ops.shopRestockSec * 1000));
  timers.push(
    timer(
      'General',
      'weekly',
      'Weekly reset',
      'etc/TasksWeekly',
      now + (ops.shopRestockSec + 86400 * ops.option(39)) * 1000
    )
  );
  if (account.companionDataPresent || ops.companionLastClaimMs > 0) {
    const remaining = Math.max(0, COMPANION_CLAIM_MS - (1000 * global - ops.companionLastClaimMs));
    timers.push(timer('General', 'companions', 'Next companion claim', 'afk_targets/Dog', now + remaining));
  }

  if (world >= 3) {
    const closestWorship = account.characterOps.reduce(
      (best, row) => {
        const rate = Math.max(0.01, (row.worshipMax - 50) / 40);
        const hoursLeft = row.worshipMax > 0 ? (row.worshipMax - row.worshipCurrent) / rate : 0;
        const leftMs = hoursLeft * 3_600_000;
        if (leftMs > 0 && (best.leftMs === 0 || leftMs < best.leftMs)) {
          return { leftMs, name: account.characters[row.index]?.name ?? '' };
        }
        return best;
      },
      { leftMs: 0, name: '' }
    );
    const syphonCharge = account.characterOps.reduce((sum, row) => sum + row.worshipCurrent, 0);
    const syphonMax = account.characterOps.reduce((max, row) => Math.max(max, row.worshipMax), 0);
    const syphonRate = account.characterOps.reduce((sum, row) => sum + Math.max(0.2, (row.worshipMax - 50) / 40), 0);
    if (syphonMax > 0 && syphonRate > 0) {
      const hours = Math.max(0, (syphonMax - syphonCharge) / syphonRate);
      timers.push(timer('General', 'syphon', 'Charge syphon overflow', 'data/ClassIcons50', now + hours * 3_600_000));
    }
    if (closestWorship.leftMs > 0) {
      timers.push(
        timer(
          'General',
          'worship-full',
          'Closest worship charge full',
          'data/ClassIcons50',
          now + closestWorship.leftMs,
          closestWorship.name
        )
      );
    }
  }

  if (ops.happyHours.length > 0) {
    const next = happyHourTimes(ops.happyHours, Date.now())[0];
    if (next) timers.push(timer('General', 'happy-hour', 'Dungeon happy hour', 'data/Dungeon1', next));
  }

  const nextEvent = nextRandomEventMs(global, ops.randEventHr, Date.now());
  if (nextEvent != null) {
    const hourSeed = Math.round(nextEvent / 3_600_000);
    const type = eventType(new LavaRand(hourSeed + ops.randEventHr).rand());
    timers.push(
      timer(
        'General',
        'random-event',
        'Next random event',
        'etc/Mega_Grumblo',
        nextEvent,
        RANDOM_EVENT_NAMES[type] ?? undefined
      )
    );
  }

  if (world >= 5 && account.sailingBoats > 0) {
    const seed = Math.floor(global / 21600);
    const nextTrade = (seed + 1) * 21600 * 1000;
    timers.push(timer('General', 'sailing-trades', 'Next sailing trades', 'data/ClassIcons54', nextTrade));
  }

  if (world >= 3) {
    timers.push(
      timer('Etc', 'library', 'Talent library', 'data/ClassIcons44', ops.libraryBooks >= 20 ? now : null, `${ops.libraryBooks} books`)
    );
  }
  for (const boss of ops.miniBosses) {
    if (!boss.unlocked) continue;
    const daysIndex = boss.rawName === 'mini3b' ? 96 : boss.rawName === 'mini4b' ? 98 : boss.rawName === 'mini5a' ? 225 : 226;
    const daysSince = ops.option(daysIndex);
    const cap = MINI_BOSS_CAPS[boss.rawName] ?? 6;
    const maxed = boss.current >= cap;
    const days = maxed ? 0 : daysTillNextMini(boss.rawName as 'mini3b', daysSince, boss.current);
    timers.push(
      timer(
        'Etc',
        `miniboss-${boss.rawName}`,
        boss.name,
        `etc/${boss.rawName}`,
        maxed ? now : now + days * 86400_000,
        maxed ? `Maxed (${boss.current})` : `${boss.current} ready · +1 in ${days}d`
      )
    );
  }
  timers.push(timer('Etc', 'vote-bonus', 'Vote bonus week', 'etc/Weekly', weekResetMs(global, 197860, now)));
  timers.push(timer('Etc', 'meritocracy', 'Meritocracy vote week', 'etc/Weekly', weekResetMs(global, 543460, now)));

  if (ops.option(253) > 0) {
    timers.push(
      timer(
        'Clickers',
        'owl-feather',
        'Feather restart',
        'data/Owl1',
        ops.owlRestartCostReady ? now : null,
        ops.owlRestartCostReady ? undefined : 'Waiting on feathers'
      )
    );
    timers.push(
      timer(
        'Clickers',
        'owl-mega',
        'Mega feather restart',
        'data/Owl2',
        ops.owlMegaRestartCostReady ? now : null,
        ops.owlMegaRestartCostReady ? undefined : 'Waiting on feathers'
      )
    );
  }
  if (ops.kangarooFisherooReady || ops.kangarooGreatestCatchReady || ops.kangarooShinyPct > 0) {
    timers.push(
      timer('Clickers', 'fisheroo', 'Fisheroo reset', 'data/Kangaroo', ops.kangarooFisherooReady ? now : null)
    );
    timers.push(
      timer(
        'Clickers',
        'greatest-catch',
        'Greatest catch',
        'data/Kangaroo',
        ops.kangarooGreatestCatchReady ? now : null
      )
    );
  }

  if (world >= 3) {
    const printerLeft = 3600 - (global - ops.printerTimeSec);
    timers.push(timer('World 3', 'printer', 'Printer cycle', 'data/ConTower0', now + printerLeft * 1000));
    const closestTrap = account.characterOps.reduce((best, row) => {
      if (row.closestTrapLeftMs == null) return best;
      if (best == null || row.closestTrapLeftMs < best) return row.closestTrapLeftMs;
      return best;
    }, null as number | null);
    if (closestTrap != null) {
      timers.push(timer('World 3', 'closest-trap', 'Closest trap', 'data/TrapBoxSet1', now + closestTrap));
    }
    if (ops.buildingsReady.length > 0) {
      const building = ops.buildingsReady[0];
      timers.push(
        timer(
          'World 3',
          'closest-building',
          'Closest building',
          `data/ConTower${building?.index ?? 0}`,
          now,
          building?.name
        )
      );
    } else {
      const tower = asIndexedNumbers(data.Tower);
      const towersLength = CONSTRUCTION_BUILDINGS.length;
      let closestCost = Number.POSITIVE_INFINITY;
      let closestIndex = -1;
      CONSTRUCTION_BUILDINGS.forEach((building, index) => {
        const level = tower[index] ?? 0;
        if (level >= building.max) return;
        const progress = tower[index + 12 + towersLength * 2] ?? 0;
        if (progress > 0 && progress < closestCost) {
          closestCost = progress;
          closestIndex = index;
        }
      });
      if (closestIndex >= 0) {
        timers.push(
          timer(
            'World 3',
            'closest-building',
            'Closest building',
            `data/ConTower${closestIndex}`,
            null,
            CONSTRUCTION_BUILDINGS[closestIndex]?.name
          )
        );
      }
    }
    if (ops.refineryRankUp.length > 0) {
      const salt = ops.refineryRankUp[0];
      timers.push(timer('World 3', 'closest-salt', 'Closest salt rank-up', `data/${salt?.rawName}`, now, salt?.saltName));
    }
    const equinoxReady = ops.equinoxCharge >= ops.equinoxChargeRequired && ops.equinoxChargeRequired > 0;
    if (ops.equinoxChargeRequired > 0) {
      timers.push(
        timer(
          'World 3',
          'equinox',
          'Equinox',
          'data/Dream0',
          equinoxReady ? now : null,
          `${Math.floor(ops.equinoxCharge)} / ${ops.equinoxChargeRequired}`
        )
      );
    }
  }

  if (world >= 5) {
    const extra = asIndexedNumbers(toList(data.Holes)[11]);
    const maxLinear = 86400 * 2;
    (
      [
        ['bravery', 11, 'Bravery monument', 'data/HoleBravery'],
        ['justice', 12, 'Justice monument', 'data/HoleJustice'],
        ['wisdom', 13, 'Wisdom monument', 'data/HoleWisdom']
      ] as const
    ).forEach(([id, extraIndex, title, icon]) => {
      const current = extra[extraIndex] ?? 0;
      const left = Math.max(0, maxLinear - current);
      const currentMulti = Math.round((100 * current) / 72e3) / 100;
      const maxMulti = Math.round((100 * maxLinear) / 72e3) / 100;
      timers.push(
        timer(
          'World 5',
          id,
          title,
          icon,
          left <= 0 ? now : now + left * 1000,
          current > maxLinear ? 'Go fight!' : `${currentMulti}x / ${maxMulti}x`
        )
      );
    });
    ops.holeVillagersReady.forEach((villager) => {
      timers.push(
        timer(
          'World 5',
          `villager-${villager.index}`,
          `${VILLAGER_NAMES[villager.index] ?? villager.name} level-up`,
          `data/Villager_${villager.index}`,
          now
        )
      );
    });
  }

  if (world >= 6) {
    const plots = toList(data.FarmPlot);
    let nextCropSec: number | null = null;
    let growing = 0;
    let grown = 0;
    for (const plot of plots) {
      const row = asIndexedNumbers(plot);
      const seedType = row[0] ?? -1;
      const locked = row[3] ?? 0;
      if (locked || seedType < 0) continue;
      growing += 1;
      const growthReq = seedType === 6 ? 25200 : 14400 * Math.pow(1.5, seedType);
      const progress = row[1] ?? 0;
      if (progress >= growthReq) {
        grown += 1;
        continue;
      }
      const left = growthReq - progress;
      if (nextCropSec == null || left < nextCropSec) nextCropSec = left;
    }
    if (growing > 0) {
      timers.push(
        timer(
          'World 6',
          'crops',
          grown === growing ? 'All crops grown' : 'Next crop ready',
          'data/ClassIcons57',
          nextCropSec == null ? now : now + nextCropSec * 1000
        )
      );
    }
  }

  if (world >= 7) {
    if (ops.sushiFuel >= ops.sushiFuelCapEstimate && ops.sushiFuelCapEstimate > 0) {
      timers.push(timer('World 7', 'sushi-fuel', 'Sushi fuel full', 'data/Sushi6', now));
    }
    ops.insightObservations.forEach((obs) => {
      timers.push(
        timer(
          'World 7',
          `insight-${obs.index}`,
          `${obs.name} insight`,
          'data/ClassIcons61',
          now,
          `Lv ${obs.insightLevel}`
        )
      );
    });
  }

  return timers.filter((item) => {
    if (item.group === 'World 5' && world < 5) return false;
    if (item.group === 'World 6' && world < 6) return false;
    if (item.group === 'World 7' && world < 7) return false;
    return true;
  });
}

export const DASHBOARD_TIMER_GROUPS = ['General', 'Etc', 'Clickers', 'World 3', 'World 5', 'World 6', 'World 7'] as const;

export function groupDashboardTimers(timers: DashboardTimer[]): { group: string; items: DashboardTimer[] }[] {
  return DASHBOARD_TIMER_GROUPS.map((group) => ({
    group,
    items: timers.filter((item) => item.group === group)
  })).filter((row) => row.items.length > 0);
}
