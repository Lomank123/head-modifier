<script lang="ts">
  import { onMount } from 'svelte';
  import { PROFILE_NAME_MAX } from '../../state/operations';

  export let mode: 'create' | 'rename' | 'delete';
  export let profileName = '';
  export let onConfirm: (name?: string) => void;
  export let onClose: () => void;

  let name = profileName;
  let inputEl: HTMLInputElement;

  $: title =
    mode === 'create' ? 'New profile' : mode === 'rename' ? 'Rename profile' : 'Delete profile';
  $: canSubmit =
    mode === 'delete' ? true : name.trim().length > 0 && name.trim() !== profileName.trim();

  onMount(() => {
    if (mode !== 'delete') {
      inputEl?.focus();
      inputEl?.select();
    }
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && canSubmit && mode !== 'delete') {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    if (mode === 'delete') onConfirm();
    else onConfirm(name.trim());
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="overlay" on:click={onClose} role="presentation">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="card" on:click|stopPropagation role="dialog" aria-label={title}>
    <div class="head">
      <h2>{title}</h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1">✕</button>
    </div>

    {#if mode === 'delete'}
      <p class="message">
        Delete profile <strong>{profileName}</strong>? This cannot be undone.
      </p>
      <div class="actions">
        <button class="secondary" on:click={onClose} tabindex="-1">Cancel</button>
        <button class="danger" on:click={submit} tabindex="-1">Delete</button>
      </div>
    {:else}
      <label class="field">
        <span class="label">Name</span>
        <input
          bind:this={inputEl}
          bind:value={name}
          maxlength={PROFILE_NAME_MAX}
          placeholder="Profile name"
          data-nav
        />
      </label>
      <div class="actions">
        <button class="secondary" on:click={onClose} tabindex="-1">Cancel</button>
        <button class="primary" disabled={!canSubmit} on:click={submit} tabindex="-1">
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
  }
  .card {
    width: 280px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: var(--gap);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  h2 {
    margin: 0;
    font-size: 15px;
  }
  .close {
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 13px;
    padding: 2px 4px;
    border-radius: var(--radius);
  }
  .close:hover {
    color: var(--text);
    background: var(--surface);
  }
  .message {
    margin: 0 0 12px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-muted);
  }
  .message strong {
    color: var(--text);
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
  }
  .label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  input {
    width: 100%;
    padding: 6px 8px;
    font-size: 13px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
  }
  input:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
  .actions button {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 6px 12px;
    font-size: 12px;
    background: var(--bg);
    color: var(--text);
  }
  .actions button:hover:not(:disabled) {
    background: var(--surface);
    border-color: var(--accent);
  }
  .actions button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .primary {
    background: var(--accent) !important;
    border-color: var(--accent) !important;
    color: #fff !important;
  }
  .primary:hover:not(:disabled) {
    filter: brightness(1.05);
  }
  .danger {
    background: var(--danger) !important;
    border-color: var(--danger) !important;
    color: #fff !important;
  }
  .danger:hover {
    filter: brightness(1.05);
  }
</style>
