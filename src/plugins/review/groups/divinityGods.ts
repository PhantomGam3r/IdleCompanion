import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const divinityGodsAdvice: AdvicePlugin = {
  id: 'divinity-gods',
  world: 'World 5',
  title: 'Divinity',
  evaluate(account) {
    const divinity = skillPeak(account, 'Divinity');
    if (divinity === 0 && account.divinityGods === 0) {
      return notReachedGroup(
        'divinity-gods',
        'World 5',
        'Divinity',
        'Unlock the W5 altar. Linked gods give huge account bonuses; one character should stay offering.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.divinityGods === 0) {
      items.push({
        title: 'No gods unlocked',
        detail: 'Meditate and offer on the first gods. Snake and the early links are the usual start.',
        severity: divinity > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.divinityGods} gods unlocked`,
        detail: 'Link the rest of the roster. Blessing levels on major gods (Goharut, Purrmep, etc.) stay relevant forever.',
        severity: account.divinityGods < 5 ? 'info' : 'good',
        current: String(account.divinityGods),
        goal: '10'
      });
    }

    return {
      id: 'divinity-gods',
      world: 'World 5',
      title: 'Divinity',
      summary: `${account.divinityGods} gods`,
      items
    };
  }
};
