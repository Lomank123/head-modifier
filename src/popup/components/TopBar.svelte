<script lang="ts">
  import type { State } from '../../types';
  import { store, history } from '../../state/store';
  import {
    addProfile,
    deleteProfile,
    renameProfile,
    setActiveProfile,
    setTheme,
    getActiveProfile,
    setUrlFilter,
  } from '../../state/operations';

  export let state: State;
  /** When true, host access isn't granted: hide profile/filter controls. */
  export let restricted = false;
  export let onOpenInfo: () => void;
  export let onOpenSettings: () => void;
  export let onOpenShortcuts: () => void;
  $: active = getActiveProfile(state);

  let menuOpen = false;
  function closeMenu() {
    menuOpen = false;
  }
  /** Run a menu action, then dismiss the menu. */
  function run(fn: () => void) {
    fn();
    menuOpen = false;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') menuOpen = false;
  }

  function switchProfile(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    store.apply((s) => setActiveProfile(s, id), true);
  }
  function newProfile() {
    const name = prompt('New profile name?');
    if (name) store.apply((s) => addProfile(s, name), true);
  }
  function rename() {
    if (!active) return;
    const name = prompt('Rename profile', active.name);
    if (name) store.apply((s) => renameProfile(s, active!.id, name), true);
  }
  function remove() {
    if (active && confirm(`Delete profile "${active.name}"?`)) {
      store.apply((s) => deleteProfile(s, active!.id), true);
    }
  }
  function toggleTheme() {
    store.apply((s) => setTheme(s, s.theme === 'dark' ? 'light' : 'dark'), true);
  }
  function onFilter(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    store.apply((s) => setUrlFilter(s, value), false);
  }
</script>

<svelte:window on:keydown={onKey} />

<header>
  <div class="line">
    {#if restricted}
      <span class="brand">HeadMod</span>
    {:else}
      <select on:change={switchProfile} value={state.activeProfileId} title="Active profile">
        {#each state.profiles as p (p.id)}
          <option value={p.id}>{p.name}</option>
        {/each}
      </select>
      <button class="icon" on:click={newProfile} title="Create profile (Shift+P)" tabindex="-1" aria-label="Create profile">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    {/if}

    <span class="spacer"></span>

    {#if !restricted}
      <span class="divider" aria-hidden="true"></span>
      <button
        class="icon"
        on:click={() => store.undo()}
        disabled={!$history.canUndo}
        title="Undo header/cookie change (⌘Z)"
        tabindex="-1"
        aria-label="Undo"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </button>
      <button
        class="icon"
        on:click={() => store.redo()}
        disabled={!$history.canRedo}
        title="Redo header/cookie change (⌘⇧Z)"
        tabindex="-1"
        aria-label="Redo"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      </button>
      <span class="divider" aria-hidden="true"></span>
    {/if}

    <div class="menu-wrap">
      <button
        class="icon"
        class:active={menuOpen}
        on:click={() => (menuOpen = !menuOpen)}
        title="More"
        tabindex="-1"
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {#if menuOpen}
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <div class="backdrop" on:click={closeMenu} role="presentation"></div>
        <div class="menu" role="menu">
          {#if !restricted}
            <button class="item" role="menuitem" on:click={() => run(rename)}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              <span>Rename profile</span>
            </button>
            <button class="item danger" role="menuitem" on:click={() => run(remove)}>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Delete profile</span>
            </button>
            <div class="divider-h" role="separator"></div>
          {/if}
          <button class="item" role="menuitem" on:click={() => run(onOpenSettings)}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
            <span class="hint">⇧S</span>
          </button>
          <button class="item" role="menuitem" on:click={() => run(onOpenInfo)}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>About HeadMod</span>
            <span class="hint">⇧I</span>
          </button>
          <button class="item" role="menuitem" on:click={() => run(onOpenShortcuts)}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
            </svg>
            <span>Keyboard shortcuts</span>
          </button>
          <div class="divider-h" role="separator"></div>
          <button class="item" role="menuitem" on:click={() => run(toggleTheme)}>
            {#if state.theme === 'dark'}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="22" />
                <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
                <line x1="2" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="22" y2="12" />
                <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
              </svg>
              <span>Light mode</span>
            {:else}
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Dark mode</span>
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
  {#if !restricted}
    <input
      class="filter"
      placeholder="URL filter (blank = all URLs)"
      value={active?.urlFilter ?? ''}
      on:input={onFilter}
      data-nav
    />
  {/if}
</header>

<style>
  header {
    padding: var(--gap);
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .line {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .spacer {
    flex: 1;
  }
  .brand {
    font-weight: 600;
    font-size: 13px;
  }
  .divider {
    flex: 0 0 auto;
    width: 1px;
    height: 18px;
    margin: 0 2px;
    background: var(--border);
  }
  select {
    flex: 0 1 110px;
    max-width: 110px;
    min-width: 0;
    padding: 4px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: border-color 0.12s ease, background 0.12s ease;
  }
  select:hover {
    border-color: var(--accent);
    background: var(--surface);
  }
  select:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 3px 6px;
    transition: background 0.12s ease, border-color 0.12s ease;
  }
  button:hover {
    background: var(--surface);
    border-color: var(--accent);
  }
  button:active {
    background: var(--border);
  }
  button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  button:disabled:hover {
    background: var(--bg);
    border-color: var(--border);
  }
  button.icon {
    width: 26px;
    height: 26px;
    padding: 0;
    line-height: 1;
  }
  button.icon.active {
    background: var(--surface);
    border-color: var(--accent);
  }

  .menu-wrap {
    position: relative;
    flex: 0 0 auto;
  }
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
  }
  .menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    z-index: 21;
    min-width: 180px;
    padding: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
  .item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    width: 100%;
    padding: 7px 8px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text);
    font-size: 12px;
    text-align: left;
  }
  .item:hover {
    background: var(--surface);
    border-color: transparent;
  }
  .item svg {
    flex: 0 0 auto;
    color: var(--text-muted);
  }
  .item .hint {
    margin-left: auto;
    color: var(--text-muted);
    font-size: 11px;
  }
  .item.danger {
    color: var(--danger);
  }
  .item.danger svg {
    color: var(--danger);
  }
  .item.danger:hover {
    background: var(--danger);
    color: #fff;
  }
  .item.danger:hover svg {
    color: #fff;
  }
  .divider-h {
    height: 1px;
    margin: 4px 0;
    background: var(--border);
  }

  .filter {
    width: 100%;
    margin-top: 6px;
    padding: 5px 6px;
    font-size: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    transition: border-color 0.12s ease, box-shadow 0.12s ease;
  }
  .filter:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
</style>
