import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const breedingPetsAdvice: AdvicePlugin = {
  id: 'breeding-pets',
  world: 'World 4',
  title: 'Breeding',
  evaluate(account) {
    const breeding = skillPeak(account, 'Breeding');
    if (breeding === 0 && account.breedingPets === 0) {
      return notReachedGroup(
        'breeding-pets',
        'World 4',
        'Breeding',
        'Unlock the W4 pet nest. Eggs hatch while you AFK; new species and territory unlocks are account-wide.'
      );
    }

    const items: AdviceItem[] = [];
    if (account.breedingPets < 8) {
      items.push({
        title: `${account.breedingPets} pet species unlocked`,
        detail: 'Keep eggs going. New species beat another shiny level on an already-owned pet.',
        severity: breeding > 0 ? 'warning' : 'info',
        current: String(account.breedingPets),
        goal: '8+'
      });
    } else {
      items.push({
        title: `${account.breedingPets} pet species`,
        detail: `Arena wave ${account.breedingArenaWave}. Territory ${account.breedingTerritory}.`,
        severity: 'good',
        current: String(account.breedingPets)
      });
    }

    if (breeding > 0 && account.breedingArenaWave < 5) {
      items.push({
        title: 'Pet arena is barely started',
        detail: 'Arena waves unlock pet slots. Run a few fights when you pass the nest.',
        severity: 'info',
        current: String(account.breedingArenaWave),
        goal: '15+'
      });
    }

    return {
      id: 'breeding-pets',
      world: 'World 4',
      title: 'Breeding',
      summary: `${account.breedingPets} pets`,
      items
    };
  }
};
