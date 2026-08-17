import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const labAdvice: AdvicePlugin = {
  id: 'lab',
  world: 'World 4',
  title: 'Laboratory',
  evaluate(account) {
    const labSkill = skillPeak(account, 'Laboratory');
    if (labSkill === 0 && account.labJewels === 0) {
      return notReachedGroup(
        'lab',
        'World 4',
        'Laboratory',
        'The W4 mainframe connects jewels and chips. Park a character on the console so bonuses stay active.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.labJewels === 0) {
      items.push({
        title: 'No lab jewels owned',
        detail: 'Craft or drop jewels and place them on the board. Connected jewels are account-wide.',
        severity: labSkill > 0 ? 'warning' : 'info'
      });
    } else {
      items.push({
        title: `${account.labJewels} jewels · ${account.labChips} chips`,
        detail: 'Keep the important nodes connected (printer, damage, cooking). Unconnected jewels do nothing.',
        severity: account.labJewels < 6 ? 'info' : 'good',
        current: String(account.labJewels)
      });
    }

    return {
      id: 'lab',
      world: 'World 4',
      title: 'Laboratory',
      summary: `${account.labJewels} jewels`,
      items
    };
  }
};
