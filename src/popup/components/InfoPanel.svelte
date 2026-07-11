<script lang="ts">
  export let onClose: () => void;

  const version = chrome.runtime.getManifest().version;
  const creator = 'Lomank';
  const github = 'https://github.com/Lomank123/head-modifier';
  const website = 'https://lomank.com';

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="overlay" on:click={onClose} role="presentation">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="card" on:click|stopPropagation role="dialog" aria-label="About HeadMod">
    <div class="head">
      <h2>HeadMod</h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1">✕</button>
    </div>
    <p class="tagline">An open source, lightweight &amp; free header / cookie injector.</p>
    <dl>
      <dt>Creator</dt>
      <dd>
        <a href={website} target="_blank" rel="noopener noreferrer">{creator}</a>
      </dd>
      <dt>Version</dt>
      <dd>{version}</dd>
      <dt>GitHub</dt>
      <dd>
        <a href={github} target="_blank" rel="noopener noreferrer">{github}</a>
      </dd>
    </dl>
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
    width: 300px;
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
    margin-bottom: 6px;
  }
  h2 {
    margin: 0;
    font-size: 15px;
  }
  .tagline {
    margin: 0 0 10px;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
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
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 12px;
    margin: 0;
    font-size: 12px;
  }
  dt {
    color: var(--text-muted);
  }
  dd {
    margin: 0;
    word-break: break-all;
  }
  a {
    color: var(--accent);
  }
</style>
