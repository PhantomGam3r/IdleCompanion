import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const starSignsAdvice: AdvicePlugin = {
  id: 'star-signs',
  world: 'World 1',
  title: 'Star signs',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (account.starSignsUnlocked === 0) {
      items.push({
        title: 'No star signs unlocked',
        detail: 'Talk to the W1 telescope astro. Cheap early signs (damage, skill exp, drop rate) are permanent unlocks.',
        severity: 'warning',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.starSignsUnlocked} star signs unlocked`,
        detail: 'Equip two (later three) on every character. Unlocking a sign is account-wide; the loadout is per character.',
        severity: account.starSignsUnlocked < 12 ? 'info' : 'good',
        current: String(account.starSignsUnlocked)
      });
    }
    return {
      id: 'star-signs',
      world: 'World 1',
      title: 'Star signs',
      summary: `${account.starSignsUnlocked} unlocked`,
      items
    };
  }
};
