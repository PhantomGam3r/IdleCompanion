import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';
import { notReachedGroup, skillPeak } from './worldSkill';

export const deathNoteAdvice: AdvicePlugin = {
  id: 'death-note',
  world: 'World 3',
  title: 'Death Note',
  evaluate(account) {
    const deathNoteBuilding = account.buildings.find((building) => building.name === 'Death Note')?.level ?? 0;
    if (deathNoteBuilding < 1 && skillPeak(account, 'Construction') === 0) {
      return notReachedGroup(
        'death-note',
        'World 3',
        'Death Note',
        'Build Death Note on the construction board. Family kills then grant multikill for each world.'
      );
    }

    const items: AdviceItem[] = [];
    if (deathNoteBuilding < 1) {
      items.push({
        title: 'Build Death Note',
        detail: 'It is a construction utility. Once it is up, farming maps to skulls is one of the best AFK multipliers.',
        severity: 'warning',
        current: '0',
        goal: '1'
      });
    }

    const note = account.deathNote;
    if (note.mapsWithKills === 0) {
      items.push({
        title: 'No kill log yet',
        detail: 'Death Note reads KLA from every character. Log into maps and AFK so skulls can start stacking.',
        severity: 'info'
      });
    } else {
      items.push({
        title: `${note.mapsWithKills} maps with kills`,
        detail: `Lowest skull on a farmed map: ${note.lowestSkull}. Gold skulls: ${note.goldSkulls}. Lava skulls: ${note.lavaSkulls}.`,
        severity: note.goldSkulls < 8 ? 'info' : 'good',
        current: note.lowestSkull
      });
    }

    const weakWorlds = note.lowestByWorld.filter(
      (row) => row.skull === 'None' || row.skull === 'Normal Skull' || row.skull === 'Copper Skull'
    );
    if (weakWorlds.length > 0 && deathNoteBuilding > 0) {
      items.push({
        title: `Low skulls in ${weakWorlds.map((row) => `W${row.world}`).join(', ')}`,
        detail: 'Push every regular map in a world to at least Copper (100k) before you deep-farm one map. Multikill is per-world.',
        severity: 'warning'
      });
    }

    return {
      id: 'death-note',
      world: 'World 3',
      title: 'Death Note',
      summary: `${note.mapsWithKills} maps · ${note.lowestSkull}`,
      items
    };
  }
};
