import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceItem } from '../../../core/parse/types';

export const forgeAdvice: AdvicePlugin = {
  id: 'forge',
  world: 'World 1',
  title: 'Forge',
  evaluate(account) {
    const items: AdviceItem[] = [];
    const slots = account.forge[0];
    if (slots && slots.purchased < 4) {
      items.push({
        title: 'Buy more forge slots',
        detail: 'Extra slots let you smelt while you AFK. This is one of the best early smithing upgrades.',
        severity: 'warning',
        current: String(slots.purchased),
        goal: String(Math.min(slots.max, 8))
      });
    }
    const speed = account.forge[2];
    if (speed && speed.purchased < 20) {
      items.push({
        title: 'Forge speed is low',
        detail: 'Speed upgrades shrink bar time. Dump extra ores here after you have a few slots.',
        severity: 'info',
        current: String(speed.purchased),
        goal: '20+'
      });
    }
    if (items.length === 0) {
      items.push({
        title: 'Forge is progressing',
        detail: account.forge.map((row) => `${row.name} ${row.purchased}/${row.max}`).join(' · '),
        severity: 'good'
      });
    }
    return {
      id: 'forge',
      world: 'World 1',
      title: 'Forge',
      summary: `${slots?.purchased ?? 0} slots`,
      items
    };
  }
};
