import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { ATOM_LEVEL_CAP } from '../../../core/parse/catalogs';
import { notReachedGroup, skillPeak } from './worldSkill';

export const atomsAdvice: AdvicePlugin = {
  id: 'atoms',
  world: 'World 3',
  title: 'Atom Collider',
  evaluate(account) {
    const collider = account.buildings.find((building) => building.name === 'Atom Collider')?.level ?? 0;
    if (collider < 1 && skillPeak(account, 'Construction') < 40 && account.atomsUnlocked === 0) {
      return notReachedGroup(
        'atoms',
        'World 3',
        'Atom Collider',
        'The Atom Collider is a late W3 construction building. Particles buy stamp, bubble, and wizard-tower atoms.'
      );
    }

    const items: AdviceItem[] = [];
    if (collider < 1) {
      items.push({
        title: 'Build the Atom Collider',
        detail: 'It sits on the construction board after the early utilities. Hydrogen (stamps) and Carbon (towers) are the usual first atoms.',
        severity: skillPeak(account, 'Construction') >= 30 ? 'warning' : 'info',
        current: '0',
        goal: '1'
      });
    }

    if (account.atomsUnlocked === 0 && collider > 0) {
      items.push({
        title: 'No atoms purchased',
        detail: 'Spend particles. Hydrogen lowers stamp costs; Carbon raises wizard tower caps.',
        severity: 'warning'
      });
    } else if (account.atomsUnlocked > 0) {
      const notMaxed = account.atoms.filter((atom) => {
        const max = atom.max ?? ATOM_LEVEL_CAP;
        return atom.level > 0 && atom.level < max;
      });
      items.push({
        title: `${account.atomsUnlocked} atoms unlocked`,
        detail:
          notMaxed.length > 0
            ? `Not maxed: ${notMaxed.map((atom) => `${atom.name} ${atom.level}/${atom.max ?? ATOM_LEVEL_CAP}`).join(' · ')}.`
            : `All unlocked atoms are at max level (${ATOM_LEVEL_CAP}).`,
        severity: account.atomsUnlocked < 4 ? 'info' : 'good',
        current: String(account.atomsUnlocked)
      });
    }

    return {
      id: 'atoms',
      world: 'World 3',
      title: 'Atom Collider',
      summary: `${account.atomsUnlocked} atoms`,
      items
    };
  }
};
