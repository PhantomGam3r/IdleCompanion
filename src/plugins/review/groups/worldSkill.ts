import type { AdvicePlugin } from '../../../core/plugins/registry';
import type { AdviceGroup, AdviceItem, ParsedAccount } from '../../../core/parse/types';

export const WORLD_ORDER = [
  'Pinchy',
  'General',
  'World 1',
  'World 2',
  'World 3',
  'World 4',
  'World 5',
  'World 6',
  'World 7'
];

export function worldAdvice(
  id: string,
  world: string,
  skill: string,
  title: string,
  unlockHint: string
): AdvicePlugin {
  return {
    id,
    world,
    title,
    evaluate(account: ParsedAccount): AdviceGroup {
      const peak = Math.max(...account.characters.map((c) => c.skills[skill] ?? 0), 0);
      const items: AdviceItem[] = [];
      if (peak === 0) {
        items.push({
          title: `${title} not started`,
          detail: unlockHint,
          severity: 'info'
        });
      } else if (peak < 30) {
        items.push({
          title: `Raise ${skill}`,
          detail: `Family peak is ${peak}. Park a character on ${skill} until it is at least 30 so later bonuses come online.`,
          severity: 'warning',
          current: String(peak),
          goal: '30'
        });
      } else {
        items.push({
          title: `${skill} ${peak}`,
          detail: `A character is training ${skill}. Keep sampling it so the rest of the account benefits.`,
          severity: 'good',
          current: String(peak)
        });
      }
      return {
        id,
        world,
        title,
        summary: peak === 0 ? 'Locked' : `Peak ${peak}`,
        items
      };
    }
  };
}

export function notReachedGroup(
  id: string,
  world: string,
  title: string,
  detail: string
): AdviceGroup {
  return {
    id,
    world,
    title,
    summary: 'Locked',
    items: [{ title: `${title} not unlocked`, detail, severity: 'info' }]
  };
}

export function skillPeak(account: ParsedAccount, skill: string): number {
  return Math.max(...account.characters.map((character) => character.skills[skill] ?? 0), 0);
}
