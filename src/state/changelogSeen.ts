const STORAGE_KEY = 'headmod:lastSeenVersion';

export function currentVersion(): string {
  return chrome.runtime.getManifest().version;
}

export async function shouldShowWhatsNew(): Promise<boolean> {
  const version = currentVersion();
  const raw = await chrome.storage.local.get(STORAGE_KEY);
  return raw[STORAGE_KEY] !== version;
}

export async function markVersionSeen(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: currentVersion() });
}
