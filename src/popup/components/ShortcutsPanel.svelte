<script lang="ts">
  export let onClose: () => void;

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  const shortcuts: { keys: string[]; label: string }[] = [
    { keys: ['Shift', 'H'], label: 'Add request header' },
    { keys: ['Shift', 'C'], label: 'Add request cookie' },
    { keys: ['Shift', 'P'], label: 'New profile' },
    { keys: ['Shift', 'Space'], label: 'Toggle on/off' },
    { keys: ['⌘', 'Z'], label: 'Undo (header/cookie)' },
    { keys: ['⌘', '⇧', 'Z'], label: 'Redo (header/cookie)' },
  ];
</script>

<svelte:window on:keydown={onKey} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="overlay" on:click={onClose} role="presentation">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="card" on:click|stopPropagation role="dialog" aria-label="Keyboard shortcuts">
    <div class="head">
      <h2>Keyboard shortcuts</h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1">✕</button>
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
    max-height: 90vh;
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
