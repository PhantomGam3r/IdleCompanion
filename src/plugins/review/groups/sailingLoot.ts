import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const sailingLootAdvice: AdvicePlugin = {
  id: 'sailing-loot',
  world: 'World 5',
  title: 'Sailing',
  evaluate(account) {
    const sailing = skillPeak(account, 'Sailing');
    if (sailing === 0 && account.sailingArtifacts === 0 && account.sailingIslands <= 1) {
      return notReachedGroup(
        'sailing-loot',
        'World 5',
        'Sailing',
        'Unlock the W5 docks. Boats find artifacts; keep captains assigned so chests keep coming in.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.sailingArtifacts === 0) {
      items.push({
        title: 'No artifacts found',
        detail: 'Send boats to the first islands. New artifacts usually beat another boat upgrade.',
        severity: sailing > 0 ? 'warning' : 'info',
        current: '0'
      });
    } else {
      items.push({
        title: `${account.sailingArtifacts} artifacts (${account.sailingArtifactTiers} tiers)`,
        detail: `${account.sailingIslands} islands, ${account.sailingBoats} boats, ${account.sailingCaptains} captains. Ancient/eldritch forms come from extra chests.`,
        severity: account.sailingArtifacts < 10 ? 'info' : 'good',
        current: String(account.sailingArtifactTiers)
      });
    }

    if (account.sailingBoats > 1 && account.sailingCaptains < account.sailingBoats) {
      items.push({
        title: 'More boats than captains',
        detail: 'Idle boats find nothing. Hire captains or park extras.',
        severity: 'warning',
        current: `${account.sailingCaptains}/${account.sailingBoats}`
      });
    }

    return {
      id: 'sailing-loot',
      world: 'World 5',
      title: 'Sailing',
      summary: `${account.sailingArtifacts} artifacts`,
      items
    };
  }
};
