/** True on macOS (and iOS/iPadOS in extension contexts that expose it). */
export const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent);

export type ShortcutPlatform = 'mac' | 'win';

/** Default shortcut labels for the current OS. */
export const defaultShortcutPlatform: ShortcutPlatform = isMac ? 'mac' : 'win';

/** Primary modifier label for shortcut display (⌘ on Mac, Ctrl elsewhere). */
export const modKeyLabel = isMac ? '⌘' : 'Ctrl';

export function modKeyLabelFor(platform: ShortcutPlatform): string {
  return platform === 'mac' ? '⌘' : 'Ctrl';
}

export function shiftLabelFor(platform: ShortcutPlatform): string {
  return platform === 'mac' ? '⇧' : 'Shift';
}
