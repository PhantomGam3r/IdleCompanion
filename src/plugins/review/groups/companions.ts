import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

const NOTABLE = ['King Doot', 'Rift Slug', 'Sheepie'];

export const companionsAdvice: AdvicePlugin = {
  id: 'companions',
  world: 'General',
  title: 'Companions',
  evaluate(account) {
    const items: AdviceItem[] = [];
    if (!account.companionDataPresent) {
      items.push({
        title: 'Companion list missing from this JSON',
        detail:
          'Cloud Google login loads Realtime DB `_comp/{uid}`. Toolbox JSON needs a `companion.l` list; Efficiency uses a `companions` id array. No local switches are invented.',
        severity: 'info',
        current: '0'
      });
    } else if (account.companionsOwned === 0) {
      items.push({
        title: 'No companions owned',
        detail: 'Open companion boxes from the gem shop / events. King Doot, Rift Slug, and Sheepie are the big account-wide pets.',
        severity: 'info',
        current: '0'
      });
    } else {
      const missing = NOTABLE.filter((name) => !account.companionNames.includes(name));
      items.push({
        title: `${account.companionsOwned} companions`,
        detail:
          missing.length > 0
            ? `Owned include ${account.companionNames.slice(0, 6).join(', ')}. Still missing ${missing.join(', ')}.`
            : `Notable pets present: ${NOTABLE.join(', ')}.`,
        severity: missing.length > 0 ? 'info' : 'good',
        current: String(account.companionsOwned)
      });
    }

    return {
      id: 'companions',
      world: 'General',
      title: 'Companions',
      summary: account.companionDataPresent ? `${account.companionsOwned} owned` : 'No list',
      items
    };
  }
};
