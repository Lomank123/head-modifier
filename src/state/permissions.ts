import { writable } from 'svelte/store';

/** Snapshot of host-access state, refreshed on every permission change. */
export interface PermState {
  loaded: boolean;
  /** `<all_urls>` is granted — HeadMod may modify every site. */
  allUrls: boolean;
  /** Granted per-site origin patterns, e.g. `https://example.com/*`. */
  origins: string[];
  /** Active tab URL (available via activeTab when the popup is opened). */
  currentUrl?: string;
  /** Injectable origin pattern for the active tab, or undefined if not http(s). */
  currentOrigin?: string;
  /** True if the active tab is covered by a granted permission. */
  currentGranted: boolean;
}

const ALL_URLS = '<all_urls>';

/** Build an origin match pattern (`https://host/*`) from a URL, http(s) only. */
export function originPattern(url: string): string | undefined {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return undefined;
    return `${u.protocol}//${u.hostname}/*`;
  } catch {
    return undefined;
  }
}

/** Human-readable host from an origin pattern (`https://example.com/*` → `example.com`). */
export function hostOf(pattern: string): string {
  return pattern.replace(/^https?:\/\//, '').replace(/\/\*$/, '');
}

async function read(): Promise<PermState> {
  const allUrls = await chrome.permissions.contains({ origins: [ALL_URLS] });
  const all = await chrome.permissions.getAll();
  const origins = (all.origins ?? []).filter((o) => o !== ALL_URLS);

  let currentUrl: string | undefined;
  let currentOrigin: string | undefined;
  let currentGranted = allUrls;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tab?.url ?? undefined;
    currentOrigin = currentUrl ? originPattern(currentUrl) : undefined;
    if (!allUrls && currentOrigin) {
      currentGranted = await chrome.permissions.contains({ origins: [currentOrigin] });
    }
  } catch {
    /* tab URL unavailable — leave current* undefined */
  }

  return { loaded: true, allUrls, origins, currentUrl, currentOrigin, currentGranted };
}

function createPermissions() {
  const { subscribe, set } = writable<PermState>({
    loaded: false,
    allUrls: false,
    origins: [],
    currentGranted: false,
  });

  async function refresh() {
    set(await read());
  }

  chrome.permissions.onAdded.addListener(refresh);
  chrome.permissions.onRemoved.addListener(refresh);
  refresh();

  return {
    subscribe,
    refresh,
    /** Request `<all_urls>`. Must be called from a user gesture. */
    async grantAll() {
      await chrome.permissions.request({ origins: [ALL_URLS] });
      await refresh();
    },
    async revokeAll() {
      await chrome.permissions.remove({ origins: [ALL_URLS] });
      await refresh();
    },
    /** Request a single origin pattern. Must be called from a user gesture. */
    async grantOrigin(pattern: string) {
      await chrome.permissions.request({ origins: [pattern] });
      await refresh();
    },
    async revokeOrigin(pattern: string) {
      await chrome.permissions.remove({ origins: [pattern] });
      await refresh();
    },
  };
}

export const permissions = createPermissions();
