<script lang="ts">
  import type { Rule } from '../../types';
  export let rule: Rule;
  export let onChange: (rule: Rule, immediate: boolean) => void;
  export let onDelete: (id: string) => void;

  function toggleEnabled() {
    onChange({ ...rule, enabled: !rule.enabled }, true);
  }
  function setName(e: Event) {
    onChange({ ...rule, name: (e.target as HTMLInputElement).value }, false);
  }
  function setValue(e: Event) {
    onChange({ ...rule, value: (e.target as HTMLInputElement).value }, false);
  }
  function toggleTarget() {
    onChange({ ...rule, target: rule.target === 'request' ? 'response' : 'request' }, true);
  }
</script>

<div class="row" class:disabled={!rule.enabled}>
  <input type="checkbox" checked={rule.enabled} on:change={toggleEnabled} title="Enable/disable" />
  <input class="name" placeholder="name" value={rule.name} on:input={setName} />
  <input class="value" placeholder="value" value={rule.value} on:input={setValue} />
  <button class="target" on:click={toggleTarget} title="Toggle request/response">
    {rule.target === 'request' ? 'req' : 'res'}
  </button>
  <button class="del" on:click={() => onDelete(rule.id)} title="Delete">✕</button>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
  }
  .row.disabled .name,
  .row.disabled .value {
    color: var(--disabled);
  }
  input.name,
  input.value {
    flex: 1;
    min-width: 0;
    padding: 4px 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 12px;
  }
  button {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 3px 6px;
    font-size: 11px;
  }
  button.del {
    color: var(--danger);
    border-color: transparent;
    background: transparent;
  }
</style>
