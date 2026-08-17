import { getAdvicePlugins } from '../../core/plugins/registry';
import { WORLD_ORDER } from './groups/worldSkill';
import type { ParsedAccount } from '../../core/parse/types';

export function runReview(account: ParsedAccount) {
  const groups = getAdvicePlugins()
    .map((plugin) => plugin.evaluate(account))
    .filter((group) => group != null);
  return [...groups].sort((a, b) => WORLD_ORDER.indexOf(a.world) - WORLD_ORDER.indexOf(b.world));
}
