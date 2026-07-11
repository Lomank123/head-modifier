import { writable } from 'svelte/store';
import type { Rule, State } from '../types';
import { createDefaultState } from './defaults';
import { ensureMinRows } from './operations';

const STORAGE_KEY = 'headmod:state';
/** Cap on how many past rule-states we remember. */
const UNDO_LIMIT = 100;
/** Consecutive text edits within this window collapse into a single undo step. */
const COALESCE_MS = 600;

/** Reactive flags for enabling/disabling the undo & redo buttons. */
export const history = writable({ canUndo: false, canRedo: false });

/**
 * Undo/redo is scoped to header/cookie rules only — never theme, profiles,
 * URL filter or the on/off switch. A snapshot therefore captures just the
 * headers & cookies of every profile, keyed by profile id.
 */
type RuleSnapshot = Record<string, { headers: Rule[]; cookies: Rule[] }>;

function snapshotRules(s: State): RuleSnapshot {
  const snap: RuleSnapshot = {};
  for (const p of s.profiles) snap[p.id] = { headers: p.headers, cookies: p.cookies };
  return snap;
}

/** Restore rule data from a snapshot, leaving all other state untouched. */
function restoreRules(s: State, snap: RuleSnapshot): State {
  return {
    ...s,
    profiles: s.profiles.map((p) =>
      snap[p.id] ? { ...p, headers: snap[p.id].headers, cookies: snap[p.id].cookies } : p,
    ),
  };
}

function createStore() {
  const { subscribe, set, update } = writable<State>(createDefaultState());
  let current = createDefaultState();
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  const undoStack: RuleSnapshot[] = [];
  const redoStack: RuleSnapshot[] = [];
  let lastWasCoalesce = false;
  let lastRecordAt = 0;

  subscribe((s) => (current = s));

  function syncHistory() {
    history.set({ canUndo: undoStack.length > 0, canRedo: redoStack.length > 0 });
  }

  // Hydrate from storage on load. (A raw set() never records history.)
  chrome.storage.local.get(STORAGE_KEY).then((raw) => {
    if (raw[STORAGE_KEY]) set(ensureMinRows(raw[STORAGE_KEY] as State));
  });

  function persist(state: State, immediate: boolean) {
    if (saveTimer) clearTimeout(saveTimer);
    const write = () => void chrome.storage.local.set({ [STORAGE_KEY]: state });
    if (immediate) write();
    else saveTimer = setTimeout(write, 300);
  }

  function record(prev: RuleSnapshot, immediate: boolean) {
    const now = Date.now();
    const coalesce = !immediate && lastWasCoalesce && now - lastRecordAt < COALESCE_MS;
    if (!coalesce) {
      undoStack.push(prev);
      if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    }
    redoStack.length = 0;
    lastWasCoalesce = !immediate;
    lastRecordAt = now;
    syncHistory();
  }

  return {
    subscribe,
    /**
     * @param immediate persist now (toggles/structural) vs debounce (typing)
     * @param track when true, this change is a header/cookie edit and is
     *   recorded on the undo stack. Everything else is untracked.
     */
    apply(fn: (s: State) => State, immediate = true, track = false) {
      update((s) => {
        const next = fn(s);
        if (next === s) return s; // no-op: don't pollute history
        if (track) record(snapshotRules(s), immediate);
        persist(next, immediate);
        return next;
      });
    },
    undo() {
      if (undoStack.length === 0) return;
      const prev = undoStack.pop() as RuleSnapshot;
      redoStack.push(snapshotRules(current));
      lastWasCoalesce = false;
      const next = restoreRules(current, prev);
      set(next);
      persist(next, true);
      syncHistory();
    },
    redo() {
      if (redoStack.length === 0) return;
      const snap = redoStack.pop() as RuleSnapshot;
      undoStack.push(snapshotRules(current));
      lastWasCoalesce = false;
      const next = restoreRules(current, snap);
      set(next);
      persist(next, true);
      syncHistory();
    },
  };
}

export const store = createStore();
