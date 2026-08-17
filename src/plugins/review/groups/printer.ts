import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const printerAdvice: AdvicePlugin = {
  id: 'printer',
  world: 'World 3',
  title: '3D Printer',
  evaluate(account) {
    const printer = account.buildings.find((building) => building.name === '3D Printer')?.level ?? 0;
    if (printer < 1 && skillPeak(account, 'Construction') === 0) {
      return notReachedGroup(
        'printer',
        'World 3',
        '3D Printer',
        'Build the 3D Printer, then sample ores, bars, and bubbles. Samples print while you AFK.'
      );
    }

    const items: AdviceItem[] = [];
    if (printer < 1) {
      items.push({
        title: 'Build the 3D Printer',
        detail: 'It is the first construction utility. Samples are one of the strongest idle gains in the game.',
        severity: 'warning',
        current: '0',
        goal: '1'
      });
    }

    if (account.printerSamples === 0) {
      items.push({
        title: 'No printer samples stored',
        detail: 'Use the star talent to sample. Start with ores, bars, and alchemy liquids.',
        severity: printer > 0 ? 'warning' : 'info'
      });
    } else {
      items.push({
        title: `${account.printerSamples} unique samples`,
        detail: 'Keep printing the samples you actually spend. Replace weak prints when a slot opens.',
        severity: account.printerSamples < 6 ? 'info' : 'good',
        current: String(account.printerSamples)
      });
    }

    if (account.libraryBooks >= 20) {
      items.push({
        title: `${account.libraryBooks} talent books waiting`,
        detail: 'The library is capped. Check out books so new ones can generate.',
        severity: 'warning',
        current: String(account.libraryBooks)
      });
    }

    return {
      id: 'printer',
      world: 'World 3',
      title: '3D Printer',
      summary: `${account.printerSamples} samples`,
      items
    };
  }
};
