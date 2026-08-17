import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const riftAdvice: AdvicePlugin = {
  id: 'rift',
  world: 'World 4',
  title: 'Rift',
  evaluate(account) {
    if (account.riftLevel === 0 && account.highestWorld < 4) {
      return notReachedGroup(
        'rift',
        'World 4',
        'Rift',
        'The W4 rift is a long skill-based dungeon. Later levels unlock construction mastery, shiny pets, and more.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.riftLevel === 0) {
      items.push({
        title: 'Rift not started',
        detail: 'Talk to Rift Ripper in W4. Early levels are slow; the bonuses (especially Construction Mastery around level 6+) are huge.',
        severity: skillPeak(account, 'Cooking') > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `Rift level ${account.riftLevel}`,
        detail:
          account.riftLevel < 6
            ? 'Push toward Construction Mastery. It doubles a lot of W3 building value.'
            : 'Keep clearing levels when you can. Later rift bonuses stay relevant into W6.',
        severity: account.riftLevel < 6 ? 'info' : 'good',
        current: String(account.riftLevel),
        goal: account.riftLevel < 6 ? '6' : undefined
      });
    }

    return {
      id: 'rift',
      world: 'World 4',
      title: 'Rift',
      summary: account.riftLevel === 0 ? 'Locked' : `Lv ${account.riftLevel}`,
      items
    };
  }
};
