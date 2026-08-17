import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const saltLickAdvice: AdvicePlugin = {
  id: 'salt-lick',
  world: 'World 3',
  title: 'Salt Lick',
  evaluate(account) {
    const building = account.buildings.find((row) => row.name === 'Salt Lick')?.level ?? 0;
    if (building < 1 && skillPeak(account, 'Construction') === 0) {
      return notReachedGroup(
        'salt-lick',
        'World 3',
        'Salt Lick',
        'Build Salt Lick on the construction board, then spend salts on printer samples, EXP, and max books.'
      );
    }

    const items: AdviceItem[] = [];
    if (building < 1) {
      items.push({
        title: 'Build Salt Lick',
        detail: 'It sits next to Death Note on the construction board. Upgrades are cheap account-wide multipliers.',
        severity: 'warning',
        current: '0',
        goal: '1'
      });
    }

    const leveled = account.saltLick.filter((upgrade) => upgrade.level > 0);
    if (building > 0 && leveled.length === 0) {
      items.push({
        title: 'No Salt Lick upgrades bought',
        detail: 'Printer Sample Size and EXP are the usual first spends. Dump leftover salts instead of hoarding.',
        severity: 'warning'
      });
    } else if (leveled.length > 0) {
      items.push({
        title: `${leveled.length} Salt Lick upgrades`,
        detail: leveled
          .slice(0, 4)
          .map((upgrade) => `${upgrade.name} ${upgrade.level}`)
          .join(' · '),
        severity: leveled.length < 4 ? 'info' : 'good',
        current: String(leveled.length)
      });
    }

    return {
      id: 'salt-lick',
      world: 'World 3',
      title: 'Salt Lick',
      summary: `${leveled.length} upgrades`,
      items
    };
  }
};
