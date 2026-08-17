import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const generalAdvice: AdvicePlugin = {
  id: 'general',
  world: 'General',
  title: 'Account basics',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.characters.length < 10) {
      items.push({
        title: 'Unlock more character slots',
        detail: `You have ${account.characters.length} characters. Idleon accounts can hold up to 10 (later 11). Extra characters speed up stamps, bubbles, and skill sampling.`,
        severity: 'warning' as const,
        current: String(account.characters.length),
        goal: '10'
      });
    } else {
      items.push({
        title: 'Character roster looks complete',
        detail: `You are using ${account.characters.length} characters.`,
        severity: 'good' as const,
        current: String(account.characters.length)
      });
    }

    if (account.isStale) {
      items.push({
        title: 'Cloudsave is stale',
        detail: 'The last in-game snapshot is over 24 hours old. Log into Legends of Idleon so companion tools see fresh data.',
        severity: 'warning' as const
      });
    } else {
      items.push({
        title: 'Save is fresh',
        detail: 'Your cloudsave was updated within the last day.',
        severity: 'good' as const
      });
    }

    const worldsLeft = 7 - account.highestWorld;
    if (worldsLeft > 0) {
      items.push({
        title: `World ${account.highestWorld} progress`,
        detail: `Highest detected world is ${account.highestWorld}. Push portals and skill unlocks to open later worlds.`,
        severity: 'info' as const,
        current: `W${account.highestWorld}`,
        goal: 'W7'
      });
    } else {
      items.push({
        title: 'World 7 unlocked',
        detail: 'Spelunking or late-game maps are present on this save.',
        severity: 'good' as const
      });
    }

    return {
      id: 'general',
      world: 'General',
      title: 'Account basics',
      summary: `${items.filter((i) => i.severity !== 'good').length} follow-ups`,
      items
    };
  }
};
