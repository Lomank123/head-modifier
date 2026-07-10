<script lang="ts">
  import type { Rule, RuleTarget } from '../../types';
  import { store } from '../../state/store';
  import { addRow, updateRow, deleteRow } from '../../state/operations';
  import RuleRow from './RuleRow.svelte';

  export let section: 'headers' | 'cookies';
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

<div class="list">
  {#each rows as row (row.id)}
    <RuleRow rule={row} {onChange} {onDelete} />
  {/each}
  {#if rows.length === 0}
    <p class="empty">No {section} yet.</p>
  {/if}
  <div class="actions">
    <button on:click={() => add('request')}>+ request {noun}</button>
    <button on:click={() => add('response')}>+ response {noun}</button>
  </div>
</div>

<style>
  .list {
    padding: var(--gap);
  }
  .empty {
    color: var(--text-muted);
    font-size: 12px;
    margin: 4px 0;
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
  }
</style>
