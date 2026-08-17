import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const sigilsAdvice: AdvicePlugin = {
  id: 'sigils',
  world: 'World 2',
  title: 'Sigils',
  evaluate(account) {
    const alchemy = skillPeak(account, 'Alchemy');
    if (account.highestWorld < 2 && alchemy === 0) {
      return notReachedGroup(
        'sigils',
        'World 2',
        'Sigils',
        'Sigils sit on the alchemy pay-to-win tab. Park extra characters there once cauldrons are staffed.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.sigilsUnlocked === 0) {
      items.push({
        title: 'No sigils charging',
        detail: 'Assign spare characters to sigils after the four cauldrons have workers. Early movement and damage sigils are huge.',
        severity: alchemy >= 20 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.sigilsUnlocked} sigils started`,
        detail: 'Leave characters parked until a sigil finishes, then swap to the next. Finished sigils stay permanent.',
        severity: account.sigilsUnlocked < 4 ? 'info' : 'good',
        current: String(account.sigilsUnlocked)
      });
    }

    return {
      id: 'sigils',
      world: 'World 2',
      title: 'Sigils',
      summary: `${account.sigilsUnlocked} started`,
      items
    };
  }
};
