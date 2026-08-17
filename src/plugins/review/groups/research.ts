import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const researchAdvice: AdvicePlugin = {
  id: 'research',
  world: 'World 7',
  title: 'Research',
  evaluate(account) {
    const spelunking = skillPeak(account, 'Spelunking');
    if (spelunking === 0 && account.researchCells === 0) {
      return notReachedGroup(
        'research',
        'World 7',
        'Research',
        'World 7 research is a grid of account bonuses. Place shapes and raise cell levels.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.researchCells === 0) {
      items.push({
        title: 'Research grid empty',
        detail: 'Unlock the W7 research board and drop a magnifying glass on an empty cell.',
        severity: spelunking > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.researchCells} research cells`,
        detail: `${account.researchOccurrences} occurrences found. Keep insight leveling on the bonuses you actually use.`,
        severity: account.researchCells < 12 ? 'info' : 'good',
        current: String(account.researchCells)
      });
    }

    return {
      id: 'research',
      world: 'World 7',
      title: 'Research',
      summary: `${account.researchCells} cells`,
      items
    };
  }
};
