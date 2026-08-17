import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { formatCount } from '../../../core/parse/helpers';
import { notReachedGroup, skillPeak } from './worldSkill';

const UNSPENT_THRESHOLD = 25;
const UNSPENT_LIST_CAP = 8;

function leftoverBoxes(earned: number, invested: number): number {
  return Math.max(0, Math.round(earned) - Math.round(invested));
}

export const postOfficeAdvice: AdvicePlugin = {
  id: 'post-office',
  world: 'World 2',
  title: 'Post Office',
  evaluate(account) {
    if (account.highestWorld < 2 && account.postOfficeBoxesEarned === 0) {
      return notReachedGroup(
        'post-office',
        'World 2',
        'Post Office',
        'Unlock Postboy Pablob in W2 town. Order completions are account-wide; spend the boxes on every character.'
      );
    }

    const items: AdviceItem[] = [];
    const earned = Math.round(account.postOfficeBoxesEarned);
    const earnedLabel = formatCount(earned);
    if (earned === 0) {
      items.push({
        title: 'No delivery boxes earned',
        detail: 'Fill post office orders. Every character spends from the same earned pool, so completions snowball.',
        severity: skillPeak(account, 'Alchemy') > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${earnedLabel} Post Office boxes earned`,
        detail: 'Spend leftover boxes on Utilitarian Capsule, loot, and class-relevant crates. Unspent boxes do nothing.',
        severity: 'good',
        current: earnedLabel
      });
    }

    const unspent = account.characters
      .map((character) => ({
        name: character.name,
        leftover: leftoverBoxes(earned, character.postOfficeInvested)
      }))
      .filter((row) => row.leftover >= UNSPENT_THRESHOLD)
      .sort((a, b) => b.leftover - a.leftover || a.name.localeCompare(b.name));

    if (unspent.length > 0) {
      const shown = unspent.slice(0, UNSPENT_LIST_CAP);
      const extra = unspent.length - shown.length;
      const list = shown.map((row) => `${row.name} ${formatCount(row.leftover)}`).join(' · ');
      const extraNote = extra > 0 ? ` · +${extra} more` : '';
      const biggest = shown[0];
      items.push({
        title:
          unspent.length === 1
            ? `${biggest.name} has unspent Post Office boxes`
            : `${unspent.length} characters have unspent Post Office boxes`,
        detail: `${list}${extraNote}. Spend them on crate upgrades before they pile up.`,
        severity: 'warning',
        current: formatCount(biggest.leftover)
      });
    }

    const empty = account.characters.filter((character) => character.postOfficeInvested === 0);
    if (earned > 0 && empty.length > 0) {
      const names = empty
        .slice(0, 3)
        .map((character) => character.name)
        .join(', ');
      const extra = empty.length > 3 ? ` (+${empty.length - 3} more)` : '';
      items.push({
        title:
          empty.length === 1
            ? `${empty[0]?.name} has no Post Office crates`
            : `${empty.length} characters have no Post Office crates`,
        detail: `Start with ${names}${extra}. Even a few levels in damage or AFK crates help.`,
        severity: 'warning'
      });
    }

    return {
      id: 'post-office',
      world: 'World 2',
      title: 'Post Office',
      summary: `${earnedLabel} earned`,
      items
    };
  }
};
