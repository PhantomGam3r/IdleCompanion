import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { hasClass, notReachedGroup } from './worldSkill';

export const tesseractAdvice: AdvicePlugin = {
  id: 'tesseract',
  world: 'World 6',
  title: 'Tesseract',
  evaluate(account) {
    const cultist = hasClass(account, 'Arcane Cultist');
    if (!cultist && account.tesseractLevels === 0) {
      return notReachedGroup(
        'tesseract',
        'World 6',
        'Tesseract',
        'Arcane Cultist (W6 mage master) unlocks the tesseract. Tachyon upgrades are account-wide.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.tesseractLevels === 0) {
      items.push({
        title: 'Tesseract unused',
        detail: 'Spend tachyons on the first damage and extra-tachyon rows. Prisma bubbles stack on top.',
        severity: cultist ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.tesseractLevels} tesseract levels`,
        detail: 'Keep an Arcane Cultist on maps that drop the tachyon color you need next.',
        severity: account.tesseractLevels < 40 ? 'info' : 'good',
        current: String(account.tesseractLevels)
      });
    }

    return {
      id: 'tesseract',
      world: 'World 6',
      title: 'Tesseract',
      summary: `${account.tesseractLevels} levels`,
      items
    };
  }
};
