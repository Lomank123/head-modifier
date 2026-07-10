import type { State } from '../types';
import { buildRules } from '../engine/buildRules';

export interface DnrApi {
  getDynamicRules(): Promise<chrome.declarativeNetRequest.Rule[]>;
  updateDynamicRules(opts: {
    removeRuleIds?: number[];
    addRules?: chrome.declarativeNetRequest.Rule[];
  }): Promise<void>;
}

export function computeBadge(state: State): { text: string; enabled: boolean } {
  if (!state.globalEnabled) return { text: '', enabled: false };
  const count = buildRules(state).length;
  return { text: count === 0 ? '' : String(count), enabled: true };
}

export async function syncDynamicRules(state: State, dnr: DnrApi): Promise<void> {
  const existing = await dnr.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);
  const addRules = buildRules(state);
  await dnr.updateDynamicRules({ removeRuleIds, addRules });
}
