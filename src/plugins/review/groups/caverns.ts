import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup } from './worldSkill';

export const cavernsAdvice: AdvicePlugin = {
  id: 'caverns',
  world: 'World 5',
  title: 'Caverns',
  evaluate(account) {
    if (account.cavernsUnlocked === 0 && account.highestWorld < 5) {
      return notReachedGroup(
        'caverns',
        'World 5',
        'Caverns',
        'The Hole in W5 town unlocks caverns, villagers, and schematics. Explorer levels open the next cavern.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.cavernsUnlocked === 0) {
      items.push({
        title: 'The Hole not started',
        detail: 'Talk to the W5 caverns NPC. Explorer levels (Polonai) unlock each cavern in order.',
        severity: 'warning',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.cavernsUnlocked} caverns unlocked`,
        detail: `Villager levels: ${account.villagerLevels}. Schematics: ${account.cavernSchematics}. Keep opals on the villagers you actually use.`,
        severity: account.cavernsUnlocked < 5 ? 'info' : 'good',
        current: String(account.cavernsUnlocked)
      });
    }

    return {
      id: 'caverns',
      world: 'World 5',
      title: 'Caverns',
      summary: account.cavernsUnlocked === 0 ? 'Locked' : `${account.cavernsUnlocked} caverns`,
      items
    };
  }
};
