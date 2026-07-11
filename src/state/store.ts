import { writable } from 'svelte/store';
import type { State } from '../types';
import { createDefaultState } from './defaults';
import { ensureMinRows } from './operations';

const STORAGE_KEY = 'headmod:state';

function createStore() {
  const { subscribe, set, update } = writable<State>(createDefaultState());
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  // Hydrate from storage on load.
  chrome.storage.local.get(STORAGE_KEY).then((raw) => {
    if (raw[STORAGE_KEY]) set(ensureMinRows(raw[STORAGE_KEY] as State));
  });

  function persist(state: State, immediate: boolean) {
    if (saveTimer) clearTimeout(saveTimer);
    const write = () => void chrome.storage.local.set({ [STORAGE_KEY]: state });
    if (immediate) write();
    else saveTimer = setTimeout(write, 300);
  }

  return {
    subscribe,
    // immediate=true for toggles/structural changes, false for text typing
    apply(fn: (s: State) => State, immediate = true) {
      update((s) => {
        const next = fn(s);
        persist(next, immediate);
        return next;
      });
    },
  };
}

export const store = createStore();
