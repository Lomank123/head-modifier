<script lang="ts">
  import type { Rule, RuleTarget } from '../../types';
  import { store } from '../../state/store';
  import { addRow, updateRow, deleteRow, setSectionEnabled } from '../../state/operations';
  import RuleRow from './RuleRow.svelte';

  export let section: 'headers' | 'cookies';
  export let label: string;
  export let rows: Rule[];

  function onChange(rule: Rule, immediate: boolean) {
    store.apply((s) => updateRow(s, section, rule), immediate, true);
  }
  function onDelete(id: string) {
    store.apply((s) => deleteRow(s, section, id), true, true);
  }
  function add(target: RuleTarget) {
    store.apply((s) => addRow(s, section, target), true, true);
  }
  function toggleAll(e: Event) {
    const on = (e.target as HTMLInputElement).checked;
    store.apply((s) => setSectionEnabled(s, section, on), true, true);
  }

  $: noun = section === 'cookies' ? 'cookie' : 'header';
  $: shortcut = section === 'cookies' ? 'C' : 'H';
  $: allEnabled = rows.length > 0 && rows.every((r) => r.enabled);
  $: someEnabled = rows.some((r) => r.enabled);

  let collapsed = false;
  let toggleAllEl: HTMLInputElement;

  $: if (toggleAllEl) {
    toggleAllEl.indeterminate = !allEnabled && someEnabled;
  }
</script>

<section class="list">
  <div class="header-row">
    <input
      bind:this={toggleAllEl}
      type="checkbox"
      class="toggle-all"
      checked={allEnabled}
      on:change={toggleAll}
      title="Enable/disable all {label.toLowerCase()}"
    />
    <button
      class="header"
      class:collapsed
      on:click={() => (collapsed = !collapsed)}
      title={collapsed ? `Expand ${label}` : `Collapse ${label}`}
      aria-expanded={!collapsed}
      tabindex="-1"
    >
      <svg
        class="chevron"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <span>{label}</span>
    </button>
  </div>
  {#if !collapsed}
    {#each rows as row (row.id)}
      <RuleRow rule={row} {onChange} {onDelete} />
    {/each}
    <div class="actions">
      <button on:click={() => add('request')} title="Add a request {noun} (Shift+{shortcut})" tabindex="-1">
        + request {noun}
      </button>
      <button on:click={() => add('response')} title="Add a response {noun}" tabindex="-1">
        + response {noun}
      </button>
    </div>
  {/if}
</section>

<style>
  .list {
    padding: var(--gap);
    border-bottom: 1px solid var(--border);
  }
  .header-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  .header {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 4px 6px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
    transition: background 0.12s ease, color 0.12s ease;
  }
  .header:hover {
    background: var(--surface);
    color: var(--text);
  }
  .chevron {
    flex: 0 0 auto;
    transition: transform 0.15s ease;
  }
  .header.collapsed .chevron {
    transform: rotate(-90deg);
  }
  .toggle-all {
    appearance: none;
    -webkit-appearance: none;
    flex: 0 0 auto;
    width: 22px;
    height: 22px;
    margin: 0;
    display: grid;
    place-content: center;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    cursor: pointer;
    transition: background 0.12s ease, border-color 0.12s ease;
  }
  .toggle-all:hover {
    border-color: var(--accent);
  }
  .toggle-all:checked {
    background: var(--accent);
    border-color: var(--accent);
  }
  .toggle-all:checked::after {
    content: '';
    width: 5px;
    height: 9px;
    margin-top: -2px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  .toggle-all:indeterminate {
    background: var(--accent);
    border-color: var(--accent);
  }
  .toggle-all:indeterminate::after {
    content: '';
    width: 10px;
    height: 2px;
    background: #fff;
    border: none;
    transform: none;
  }
  .toggle-all:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  .actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }
  .actions button {
    border: 1px dashed var(--border);
    background: transparent;
    color: var(--accent);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 5px 8px;
    font-size: 12px;
    transition: background 0.12s ease, border-color 0.12s ease;
  }
  .actions button:hover {
    background: var(--surface);
    border-color: var(--accent);
  }
  .actions button:active {
    background: var(--border);
  }
</style>
