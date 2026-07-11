<script lang="ts">
  import type { State } from '../../types';
  import { store } from '../../state/store';
  import {
    addProfile,
    deleteProfile,
    renameProfile,
    setActiveProfile,
    setGlobalEnabled,
    setTheme,
    getActiveProfile,
    setUrlFilter,
  } from '../../state/operations';
  import InfoPanel from './InfoPanel.svelte';
  import SettingsPanel from './SettingsPanel.svelte';

  export let state: State;
  /** When true, host access isn't granted: hide profile/filter/master controls. */
  export let restricted = false;
  $: active = getActiveProfile(state);

  let showInfo = false;
  let showSettings = false;

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
  function toggleGlobal() {
    store.apply((s) => setGlobalEnabled(s, !s.globalEnabled), true);
  }
  function toggleTheme() {
    store.apply((s) => setTheme(s, s.theme === 'dark' ? 'light' : 'dark'), true);
  }
  function onFilter(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    store.apply((s) => setUrlFilter(s, value), false);
  }
</script>

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
      <button on:click={newProfile} title="Create profile" tabindex="-1">＋</button>
      <button on:click={rename} title="Edit profile" tabindex="-1">✎</button>
      <button class="icon" on:click={remove} title="Delete profile" tabindex="-1" aria-label="Delete profile">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    {/if}
    <span class="spacer"></span>
    <button class="icon" on:click={() => (showSettings = true)} title="Settings" tabindex="-1" aria-label="Settings">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    </button>
    <button class="glyph" on:click={() => (showInfo = true)} title="About HeadMod" tabindex="-1">ⓘ</button>
    <button class="glyph" on:click={toggleTheme} title="Theme" tabindex="-1">
      {state.theme === 'dark' ? '☀' : '🌙'}
    </button>
    {#if !restricted}
      <label class="master" title="Master on/off">
        <input type="checkbox" checked={state.globalEnabled} on:change={toggleGlobal} />
        {state.globalEnabled ? 'On' : 'Off'}
      </label>
    {/if}
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

{#if showInfo}
  <InfoPanel onClose={() => (showInfo = false)} />
{/if}
{#if showSettings}
  <SettingsPanel onClose={() => (showSettings = false)} />
{/if}

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
  select {
    flex: 0 1 auto;
    max-width: 150px;
    padding: 4px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
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
  button.icon,
  button.glyph {
    width: 26px;
    height: 26px;
    padding: 0;
    line-height: 1;
  }
  button.glyph {
    font-size: 15px;
  }
  .master {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 12px;
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
