<script lang="ts">
  import {
    defaultShortcutPlatform,
    modKeyLabelFor,
    shiftLabelFor,
    type ShortcutPlatform,
  } from '../platform';

  export let onClose: () => void;

  let platform: ShortcutPlatform = defaultShortcutPlatform;

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  $: modKey = modKeyLabelFor(platform);
  $: shiftLabel = shiftLabelFor(platform);
  $: shortcuts = [
    { keys: ['Shift', 'H'], label: 'Add request header' },
    { keys: ['Shift', 'C'], label: 'Add request cookie' },
    { keys: ['Shift', 'P'], label: 'New profile' },
    { keys: ['Shift', 'Space'], label: 'Toggle on/off' },
    { keys: [modKey, 'Z'], label: 'Undo (header/cookie)' },
    { keys: [modKey, shiftLabel, 'Z'], label: 'Redo (header/cookie)' },
  ];
</script>

<svelte:window on:keydown={onKey} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="overlay" on:click={onClose} role="presentation">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="card" on:click|stopPropagation role="dialog" aria-label="Keyboard shortcuts">
    <div class="head">
      <h2>
        <svg class="title-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
        Keyboard shortcuts
      </h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1" aria-label="Close">✕</button>
    </div>
    <div class="toolbar">
      <span class="toolbar-label">Show as</span>
      <div class="platform-toggle" role="group" aria-label="Shortcut platform">
        <button
          type="button"
          class:active={platform === 'mac'}
          on:click={() => (platform = 'mac')}
          tabindex="-1"
        >
          Mac
        </button>
        <button
          type="button"
          class:active={platform === 'win'}
          on:click={() => (platform = 'win')}
          tabindex="-1"
        >
          Windows
        </button>
      </div>
    </div>
    <ul class="list">
      {#each shortcuts as s}
        <li>
          <span class="combo">
            {#each s.keys as k, i}
              <kbd>{k}</kbd>{#if i < s.keys.length - 1}<span class="plus">+</span>{/if}
            {/each}
          </span>
          <span class="label">{s.label}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    padding: 16px 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  .card {
    display: flex;
    flex-direction: column;
    width: 300px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: var(--gap);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
  .head {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  h2 {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-size: 15px;
  }
  .title-icon {
    flex: 0 0 auto;
    color: var(--text-muted);
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
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }
  .toolbar-label {
    font-size: 11px;
    color: var(--text-muted);
  }
  .platform-toggle {
    display: inline-flex;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }
  .platform-toggle button {
    border: none;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    font-family: var(--font);
    font-size: 11px;
    line-height: 1.4;
    padding: 2px 8px;
    border-radius: calc(var(--radius) - 2px);
  }
  .platform-toggle button:hover {
    color: var(--text);
  }
  .platform-toggle button.active {
    background: var(--bg);
    color: var(--text);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }
  .list {
    flex: 1 1 auto;
    overflow-y: auto;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    font-size: 12px;
  }
  li + li {
    border-top: 1px solid var(--border);
  }
  .combo {
    display: flex;
    align-items: center;
    gap: 3px;
    flex: 0 0 auto;
    min-width: 110px;
  }
  .plus {
    color: var(--text-muted);
  }
  .label {
    color: var(--text);
  }
  kbd {
    display: inline-block;
    min-width: 16px;
    padding: 1px 5px;
    border: 1px solid var(--border);
    border-bottom-width: 2px;
    border-radius: 4px;
    background: var(--surface);
    color: var(--text);
    font-family: var(--font);
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
  }
</style>
