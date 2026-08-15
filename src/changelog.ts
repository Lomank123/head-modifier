export type ChangelogEntry = {
  version: string;
  items: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    items: [
      'Add changelog',
      'Remember collapsed/expanded state for headers and cookies sections',
      'URL filter toggle in the toolbar — show or hide the filter field, state persists',
      'Icons in changelog and keyboard shortcuts panel titles',
      'Platform-aware shortcut labels (Ctrl on Windows/Linux, ⌘ on macOS)',
      'UI/UX enhancements',
    ],
  },
  {
    version: '1.1.0',
    items: [
      'Toggle-all checkbox for headers and cookies sections',
      'On/off indicator in the toolbar with status dot',
      'Profile create, rename, and delete moved into in-app modals',
      'Custom profile dropdown with edit and delete on each profile',
      'Removed keyboard shortcuts for opening settings and about',
    ],
  },
  {
    version: '1.0.0',
    items: [
      'Initial release: MV3 header and cookie injector',
      'Profiles with per-profile URL filters and a global on/off switch',
      'Request and response rules for headers and cookies, with per-row enable/disable',
      'Site access prompt and settings for optional host permissions',
      'Undo/redo for header and cookie edits',
      'Keyboard shortcuts for common actions',
      'Dark mode and extension icons',
    ],
  },
];

export function getLatestChangelogEntry(): ChangelogEntry {
  return CHANGELOG[0];
}
