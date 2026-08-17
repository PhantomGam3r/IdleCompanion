import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const tomeAdvice: AdvicePlugin = {
  id: 'tome',
  world: 'World 4',
  title: 'Tome',
  evaluate(account) {
    const items: AdviceItem[] = [];
    const pages = (account.tomeBluePages ? 1 : 0) + (account.tomeRedPages ? 1 : 0);
    if (account.highestWorld < 4 && pages === 0 && account.tomeTrackedScore === 0) {
      items.push({
        title: 'Tome not reached',
        detail: 'World 4 town has the Tome. Official points are computed in-game, not stored on the cloudsave.',
        severity: 'info'
      });
    } else {
      const pageLabel =
        pages === 2 ? 'Blue and red pages unlocked' : pages === 1 ? (account.tomeBluePages ? 'Blue pages unlocked' : 'Red pages unlocked') : 'No extra pages yet';
      items.push({
        title: pageLabel,
        detail:
          'OptLacc 196/197 are the extra tome pages. The number below is a snapshot of categories this app already parses (stamps, statues, cards, …), not Lava’s official tome score.',
        severity: pages < 2 ? 'info' : 'good',
        current: String(pages),
        goal: '2'
      });
      items.push({
        title: `${account.tomeTrackedScore} tracked-category snapshot`,
        detail: 'Raise stamps, statues, cards, achievements, slab, crops, and sailing artifacts — those are the quantities the Tome actually scores.',
        severity: account.tomeTrackedScore < 40 ? 'info' : 'good',
        current: String(account.tomeTrackedScore)
      });
    }

    return {
      id: 'tome',
      world: 'World 4',
      title: 'Tome',
      summary: pages === 0 ? 'Pages locked' : `${pages} extra pages`,
      items
    };
  }
};
