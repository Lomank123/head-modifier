<script lang="ts">
  import type { Rule, RuleTarget } from '../../types';
  import { store } from '../../state/store';
  import { addRow, updateRow, deleteRow } from '../../state/operations';
  import RuleRow from './RuleRow.svelte';

  export let section: 'headers' | 'cookies';
  export let label: string;
  export let rows: Rule[];

  function onChange(rule: Rule, immediate: boolean) {
    store.apply((s) => updateRow(s, section, rule), immediate);
  }
  function onDelete(id: string) {
    store.apply((s) => deleteRow(s, section, id), true);
  }
  function add(target: RuleTarget) {
    store.apply((s) => addRow(s, section, target), true);
  }

  $: noun = section === 'cookies' ? 'cookie' : 'header';
</script>

<section class="list">
  <h2>{label}</h2>
  {#each rows as row (row.id)}
    <RuleRow rule={row} {onChange} {onDelete} />
  {/each}
  <div class="actions">
    <button on:click={() => add('request')} title="Add a request {noun}">
      + request {noun}
    </button>
    <button on:click={() => add('response')} title="Add a response {noun}">
      + response {noun}
    </button>
  </div>
</section>

<style>
  .list {
    padding: var(--gap);
    border-bottom: 1px solid var(--border);
  }
  h2 {
    margin: 0 0 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
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
