import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

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
    const earned = account.postOfficeBoxesEarned;
    if (earned === 0) {
      items.push({
        title: 'No delivery boxes earned',
        detail: 'Fill post office orders. Every character spends from the same earned pool, so completions snowball.',
        severity: skillPeak(account, 'Alchemy') > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${earned} boxes earned`,
        detail: 'Spend leftover boxes on Utilitarian Capsule, loot, and class-relevant crates. Unspent points do nothing.',
        severity: 'good',
        current: String(earned)
      });
    }

    const unspent = account.characters
      .map((character) => ({
        name: character.name,
        leftover: Math.max(0, earned - character.postOfficeInvested)
      }))
      .filter((row) => row.leftover >= 25);

    if (unspent.length > 0) {
      items.push({
        title: `${unspent.length} characters sitting on unspent boxes`,
        detail: unspent
          .slice(0, 4)
          .map((row) => `${row.name} has ${row.leftover} unspent`)
          .join('; ') + '. Dump them into a crate before you forget.',
        severity: 'warning',
        current: String(unspent[0]?.leftover ?? 0)
      });
    }

    const empty = account.characters.filter((character) => character.postOfficeInvested === 0);
    if (earned > 0 && empty.length > 0) {
      items.push({
        title: `${empty.length} characters have zero PO investment`,
        detail: `Start with ${empty
          .slice(0, 3)
          .map((character) => character.name)
          .join(', ')}. Even a few levels in damage or AFK crates help.`,
        severity: 'warning'
      });
    }

    return {
      id: 'post-office',
      world: 'World 2',
      title: 'Post Office',
      summary: `${earned} earned`,
      items
    };
  }
};
