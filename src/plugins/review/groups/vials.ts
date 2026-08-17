import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

const MAX_VIAL = 13;

export const vialsAdvice: AdvicePlugin = {
  id: 'vials',
  world: 'World 2',
  title: 'Vials',
  evaluate(account) {
    if (account.highestWorld < 2 && account.vialsUnlocked === 0) {
      return {
        id: 'vials',
        world: 'World 2',
        title: 'Vials',
        summary: 'Locked',
        items: [
          {
            title: 'Alchemy vials unlock in World 2',
            detail: 'The vial rack sits next to the cauldrons. Early vials (hp, damage, exp) are huge for the whole account.',
            severity: 'info'
          }
        ]
      };
    }

    const items: AdviceItem[] = [];
    const maxed = account.vials.filter((level) => level >= MAX_VIAL).length;
    if (account.vialsUnlocked < 8) {
      items.push({
        title: 'Unlock more vials',
        detail: 'New vials usually beat another level on an already-open one. Drop the required resource on the vial rack.',
        severity: 'warning',
        current: String(account.vialsUnlocked)
      });
    } else {
      items.push({
        title: `${account.vialsUnlocked} vials unlocked`,
        detail: `${maxed} are at rank ${MAX_VIAL}+. Total vial ranks: ${account.vialLevels}.`,
        severity: maxed >= 5 ? 'good' : 'info',
        current: String(account.vialLevels)
      });
    }

    const low = account.vials.filter((level) => level > 0 && level < 4);
    if (low.length >= 6) {
      items.push({
        title: `${low.length} vials still under rank 4`,
        detail: 'Cheap ranks are efficient. Spread resources before you try to max a single dump vial.',
        severity: 'warning'
      });
    }

    return {
      id: 'vials',
      world: 'World 2',
      title: 'Vials',
      summary: `${account.vialsUnlocked} unlocked · ${account.vialLevels} ranks`,
      items
    };
  }
};
