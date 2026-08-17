import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup } from './worldSkill';

export const armorSetsAdvice: AdvicePlugin = {
  id: 'armor-sets',
  world: 'World 3',
  title: 'Armor smithy',
  evaluate(account) {
    if (!account.armorSmithyUnlocked && account.armorSetsUnlocked === 0 && account.highestWorld < 3) {
      return notReachedGroup(
        'armor-sets',
        'World 3',
        'Armor smithy',
        'The armor-set smithy unlocks from OptLacc 380 (or enough days in 381). Completed sets are a comma list in OptLacc 379.'
      );
    }

    const items: AdviceItem[] = [];
    if (!account.armorSmithyUnlocked && account.armorSetsUnlocked === 0) {
      items.push({
        title: 'Armor smithy still locked',
        detail: `${account.armorSmithyDays} days counted toward unlock. Craft matching armor sets once the smithy opens.`,
        severity: 'info',
        current: '0'
      });
    } else if (account.armorSetsUnlocked < 3) {
      items.push({
        title: `${account.armorSetsUnlocked} armor sets complete`,
        detail: 'Finish a full set and turn it in at the W3 smithy. Set bonuses are account-wide.',
        severity: 'info',
        current: String(account.armorSetsUnlocked),
        goal: '6+'
      });
    } else {
      items.push({
        title: `${account.armorSetsUnlocked} armor sets`,
        detail: `${account.armorSmithyDays} smithy days logged. Keep completing new named sets from OptLacc 379.`,
        severity: 'good',
        current: String(account.armorSetsUnlocked)
      });
    }

    return {
      id: 'armor-sets',
      world: 'World 3',
      title: 'Armor smithy',
      summary: `${account.armorSetsUnlocked} sets`,
      items
    };
  }
};
