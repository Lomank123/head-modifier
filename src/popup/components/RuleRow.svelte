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
  <input class="name" placeholder="name" value={rule.name} on:input={setName} data-nav />
  <input class="value" placeholder="value" value={rule.value} on:input={setValue} data-nav />
  <button class="target" data-target={rule.target} on:click={toggleTarget} title="Toggle request/response" tabindex="-1">
    {rule.target === 'request' ? 'req' : 'res'}
  </button>
  <button class="del" on:click={() => onDelete(rule.id)} title="Delete" tabindex="-1">✕</button>
</div>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
  }
  .row.disabled .name:placeholder-shown,
  .row.disabled .value:placeholder-shown {
    color: var(--disabled);
  }
  input[type='checkbox'] {
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
  input[type='checkbox']:hover {
    border-color: var(--accent);
  }
  input[type='checkbox']:checked {
    background: var(--accent);
    border-color: var(--accent);
  }
  input[type='checkbox']:checked::after {
    content: '';
    width: 5px;
    height: 9px;
    margin-top: -2px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  input[type='checkbox']:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  input.name,
  input.value {
    flex: 1;
    min-width: 0;
    height: var(--control-h);
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 12px;
    transition: border-color 0.12s ease, box-shadow 0.12s ease;
  }
  input.name:focus-visible,
  input.value:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  button {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 3px 6px;
    font-size: 11px;
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
  }
  button.target {
    flex: 0 0 auto;
    width: 44px;
    height: 22px;
    padding: 0;
    text-align: center;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  button.target[data-target='request'] {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  button.target[data-target='response'] {
    color: var(--teal);
    border-color: var(--teal);
    background: var(--teal-soft);
  }
  button.target:hover {
    filter: brightness(1.08);
  }
  button.del {
    flex: 0 0 auto;
    width: var(--control-h);
    height: var(--control-h);
    padding: 0;
    color: var(--danger);
    border-color: transparent;
    background: transparent;
  }
  button.del:hover {
    background: var(--danger);
    color: #fff;
  }
</style>
