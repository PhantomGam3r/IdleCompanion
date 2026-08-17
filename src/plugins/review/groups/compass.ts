import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { hasClass, notReachedGroup } from './worldSkill';

export const compassAdvice: AdvicePlugin = {
  id: 'compass',
  world: 'World 6',
  title: 'Compass',
  evaluate(account) {
    const windWalker = hasClass(account, 'Wind Walker');
    if (!windWalker && account.compassLevels === 0) {
      return notReachedGroup(
        'compass',
        'World 6',
        'Compass',
        'Wind Walker (W6 archer master) unlocks the compass. Dust upgrades, abominations, and medallions are account-wide.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.compassLevels === 0) {
      items.push({
        title: 'Compass unused',
        detail: 'Collect dust and open the Pathfinder row. Abomination kills unlock whole paths.',
        severity: windWalker ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.compassLevels} compass levels`,
        detail: `${account.compassAbominations} abominations · ${account.compassMedallions} medallions.`,
        severity: account.compassAbominations < 3 ? 'info' : 'good',
        current: String(account.compassLevels)
      });
    }

    return {
      id: 'compass',
      world: 'World 6',
      title: 'Compass',
      summary: `${account.compassLevels} levels`,
      items
    };
  }
};
