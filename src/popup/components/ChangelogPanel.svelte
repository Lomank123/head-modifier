<script lang="ts">
  import { CHANGELOG, getLatestChangelogEntry } from '../../changelog';

  /** Full history from the menu, or single-version notes after an update. */
  export let mode: 'full' | 'update' = 'full';
  export let onClose: () => void;

  $: latest = getLatestChangelogEntry();
  $: entries = mode === 'update' ? [latest] : CHANGELOG;
  $: ariaLabel = mode === 'update' ? `HeadMod v${latest.version}` : 'Changelog';

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="overlay" class:update={mode === 'update'} on:click={onClose} role="presentation">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="card" on:click|stopPropagation role="dialog" aria-label={ariaLabel}>
    <div class="head">
      <h2>
        {#if mode === 'update'}
          HeadMod - <span class="version">v{latest.version}</span>
        {:else}
          <svg class="title-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Changelog
        {/if}
      </h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1" aria-label="Close">✕</button>
    </div>
    <div class="entries">
      {#each entries as entry, i}
        <section class:latest={mode === 'full' && i === 0}>
          {#if mode === 'full'}
            <div class="version-row">
              <h3>v{entry.version}</h3>
              {#if i === 0}
                <span class="badge">Latest</span>
              {/if}
            </div>
          {/if}
          <ul>
            {#each entry.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
    {#if mode === 'update'}
      <div class="actions">
        <button class="primary" on:click={onClose} tabindex="-1">OK</button>
      </div>
    {/if}
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
    overflow: hidden;
    z-index: 10;
  }
  .overlay.update {
    z-index: 11;
  }
  .card {
    display: flex;
    flex-direction: column;
    width: 320px;
    max-height: 360px;
    min-height: 0;
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
  .version {
    color: var(--accent);
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
  .entries {
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
    margin-right: -4px;
    padding-right: 12px;
    padding-bottom: 16px;
  }
  section + section {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  section.latest {
    padding: 8px;
    border: 1px solid var(--accent);
    border-radius: var(--radius);
    background: var(--accent-soft);
  }
  section.latest + section {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }
  .version-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }
  h3 {
    margin: 0;
    font-size: 12px;
    color: var(--accent);
  }
  .badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--bg);
    border: 1px solid var(--accent);
    border-radius: 999px;
    padding: 1px 6px;
  }
  ul {
    margin: 0;
    padding-left: 16px;
    font-size: 12px;
    line-height: 1.45;
  }
  li + li {
    margin-top: 4px;
  }
  .actions {
    flex: 0 0 auto;
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
  .actions button {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 6px 14px;
    font-size: 12px;
    background: var(--bg);
    color: var(--text);
  }
  .primary {
    background: var(--accent) !important;
    border-color: var(--accent) !important;
    color: #fff !important;
  }
  .primary:hover {
    filter: brightness(1.05);
  }
</style>
