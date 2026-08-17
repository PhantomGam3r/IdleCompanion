import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const sneakingJadeAdvice: AdvicePlugin = {
  id: 'sneaking-jade',
  world: 'World 6',
  title: 'Sneaking',
  evaluate(account) {
    const sneaking = skillPeak(account, 'Sneaking');
    if (sneaking === 0 && account.sneakingJadeUpgrades === 0 && account.sneakingNinjaLevels === 0) {
      return notReachedGroup(
        'sneaking-jade',
        'World 6',
        'Sneaking',
        'Unlock the W6 ninja temple. Jade emporium upgrades and pristine charms are account-wide.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.sneakingJadeUpgrades === 0) {
      items.push({
        title: 'Jade emporium unused',
        detail: 'Spend jade on emporium rows. Early gold-food and drop-rate unlocks pay for themselves.',
        severity: sneaking > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.sneakingJadeUpgrades} jade upgrades`,
        detail: `Ninja upgrade levels: ${account.sneakingNinjaLevels}. Pristine charms: ${account.sneakingPristineCharms}.`,
        severity: account.sneakingJadeUpgrades < 6 ? 'info' : 'good',
        current: String(account.sneakingJadeUpgrades)
      });
    }

    return {
      id: 'sneaking-jade',
      world: 'World 6',
      title: 'Sneaking',
      summary: `${account.sneakingJadeUpgrades} jade upgrades`,
      items
    };
  }
};
