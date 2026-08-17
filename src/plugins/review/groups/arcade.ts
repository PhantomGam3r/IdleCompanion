import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup } from './worldSkill';

export const arcadeAdvice: AdvicePlugin = {
  id: 'arcade',
  world: 'World 2',
  title: 'Arcade',
  evaluate(account) {
    if (account.highestWorld < 2 && account.arcadeUpgrades === 0) {
      return notReachedGroup(
        'arcade',
        'World 2',
        'Arcade',
        'The W2 arcade shop spends gold balls on account-wide bonuses. Play a round when you pass town.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.arcadeUpgrades === 0) {
      items.push({
        title: 'Arcade shop unused',
        detail: 'Gold balls buy permanent bonuses. Early damage, EXP, and drop-rate rows are cheap.',
        severity: 'warning',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.arcadeUpgrades} arcade bonuses bought`,
        detail: `Total shop levels: ${account.arcadeLevels}. Keep dumping gold balls; cosmic balls later double the cap.`,
        severity: account.arcadeLevels < 80 ? 'info' : 'good',
        current: String(account.arcadeLevels)
      });
    }

    return {
      id: 'arcade',
      world: 'World 2',
      title: 'Arcade',
      summary: `${account.arcadeUpgrades} upgrades`,
      items
    };
  }
};
