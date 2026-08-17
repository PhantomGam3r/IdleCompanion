import type { ParsedAccount } from '../../core/parse/types';
import { getAdvicePlugins } from '../../core/plugins/registry';

export function runReview(account: ParsedAccount) {
  return getAdvicePlugins()
    .map((plugin) => plugin.evaluate(account))
    .filter((group) => group != null);
}
