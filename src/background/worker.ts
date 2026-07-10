import type { State } from '../types';
import { createDefaultState } from '../state/defaults';
import { syncDynamicRules, computeBadge } from './syncRules';

const STORAGE_KEY = 'headmod:state';

async function loadState(): Promise<State> {
  const raw = await chrome.storage.local.get(STORAGE_KEY);
  return (raw[STORAGE_KEY] as State) ?? createDefaultState();
}

async function apply(state: State): Promise<void> {
  try {
    await syncDynamicRules(state, chrome.declarativeNetRequest);
    const badge = computeBadge(state);
    await chrome.action.setBadgeText({ text: badge.text });
    await chrome.action.setBadgeBackgroundColor({
      color: badge.enabled ? '#2563eb' : '#9ca3af',
    });
  } catch (err) {
    console.error('[HeadMod] failed to apply rules', err);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await apply(await loadState());
});

chrome.runtime.onStartup.addListener(async () => {
  await apply(await loadState());
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    void apply(changes[STORAGE_KEY].newValue as State);
  }
});
