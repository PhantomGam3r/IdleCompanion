import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { hasClass, notReachedGroup } from './worldSkill';

export const grimoireAdvice: AdvicePlugin = {
  id: 'grimoire',
  world: 'World 6',
  title: 'Grimoire',
  evaluate(account) {
    const deathBringer = hasClass(account, 'Death Bringer');
    if (!deathBringer && account.grimoireLevels === 0) {
      return notReachedGroup(
        'grimoire',
        'World 6',
        'Grimoire',
        'Death Bringer (W6 warrior master) unlocks the grimoire. Bone upgrades are account-wide wraith stats.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.grimoireLevels === 0) {
      items.push({
        title: 'Grimoire unused',
        detail: 'Kill for bones and spend them. Early damage and extra-bones rows pay for the rest of the book.',
        severity: deathBringer ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.grimoireLevels} grimoire levels`,
        detail: 'Keep a Death Bringer on kill maps that drop the bone type you are buying next.',
        severity: account.grimoireLevels < 40 ? 'info' : 'good',
        current: String(account.grimoireLevels)
      });
    }

    return {
      id: 'grimoire',
      world: 'World 6',
      title: 'Grimoire',
      summary: `${account.grimoireLevels} levels`,
      items
    };
  }
};
