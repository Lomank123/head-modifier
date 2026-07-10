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

  export let state: State;
  $: active = getActiveProfile(state);

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
    <select on:change={switchProfile} value={state.activeProfileId}>
      {#each state.profiles as p (p.id)}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>
    <button on:click={newProfile} title="New profile">＋</button>
    <button on:click={rename} title="Rename">✎</button>
    <button on:click={remove} title="Delete">🗑</button>
    <span class="spacer"></span>
    <button on:click={toggleTheme} title="Theme">{state.theme === 'dark' ? '☀' : '🌙'}</button>
    <label class="master" title="Master on/off">
      <input type="checkbox" checked={state.globalEnabled} on:change={toggleGlobal} />
      {state.globalEnabled ? 'On' : 'Off'}
    </label>
  </div>
  <input
    class="filter"
    placeholder="URL filter (blank = all URLs)"
    value={active?.urlFilter ?? ''}
    on:input={onFilter}
  />
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
  select {
    flex: 0 1 auto;
    max-width: 150px;
    padding: 4px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
  }
  button {
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--text);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 3px 6px;
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
  }
</style>
