<script lang="ts">
  export let onClose: () => void;

  const version = chrome.runtime.getManifest().version;
  const creator = 'Lomank';
  const github = 'https://github.com/Lomank123/head-modifier';
  const website = 'https://lomank.com';
  const iconUrl = chrome.runtime.getURL('icon-48.png');

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
      <h2>
        <svg class="title-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        About
      </h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1" aria-label="Close">✕</button>
    </div>

    <div class="hero">
      <img class="logo" src={iconUrl} alt="" width="48" height="48" />
      <div class="brand">
        <span class="name">HeadMod</span>
        <span class="version">v{version}</span>
      </div>
      <p class="tagline">Open source, lightweight &amp; free header / cookie injector.</p>
    </div>

    <div class="links">
      <a class="link-row" href={website} target="_blank" rel="noopener noreferrer">
        <svg class="row-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="link-text">
          <span class="link-label">Creator</span>
          <span class="link-value">{creator}</span>
        </span>
        <svg class="external" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
      <a class="link-row" href={github} target="_blank" rel="noopener noreferrer">
        <svg class="row-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
        <span class="link-text">
          <span class="link-label">Source code</span>
          <span class="link-value">GitHub</span>
        </span>
        <svg class="external" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
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
    width: 320px;
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
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 16px 12px;
    margin-bottom: 10px;
    border-radius: var(--radius);
    background: var(--surface);
    border: 1px solid var(--border);
  }
  .logo {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .name {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .version {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid var(--accent);
    border-radius: 999px;
    padding: 1px 6px;
  }
  .tagline {
    margin: 0;
    max-width: 240px;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.45;
  }
  .links {
    display: flex;
    flex-direction: row;
    gap: 6px;
  }
  .link-row {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
  }
  .link-row:hover {
    border-color: var(--accent);
    background: var(--accent-soft);
  }
  .link-row:hover .link-value {
    color: var(--accent);
  }
  .row-icon {
    flex: 0 0 auto;
    color: var(--text-muted);
  }
  .link-row:hover .row-icon {
    color: var(--accent);
  }
  .link-text {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .link-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--text-muted);
  }
  .link-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--text);
    transition: color 0.15s;
  }
  .external {
    flex: 0 0 auto;
    color: var(--text-muted);
    opacity: 0.7;
  }
  .link-row:hover .external {
    color: var(--accent);
    opacity: 1;
  }
</style>
