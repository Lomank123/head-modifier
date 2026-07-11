<script lang="ts">
  import { permissions, hostOf } from '../../state/permissions';
  import { store } from '../../state/store';
  import { setGlobalEnabled } from '../../state/operations';

  export let onClose: () => void;

  $: p = $permissions;

  function toggleGlobal(e: Event) {
    const on = (e.target as HTMLInputElement).checked;
    store.apply((s) => setGlobalEnabled(s, on), true);
  }
  $: currentHost = p.currentOrigin ? hostOf(p.currentOrigin) : undefined;
  $: currentAlreadyGranted = !!p.currentOrigin && p.origins.includes(p.currentOrigin);

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  async function toggleAll(e: Event) {
    const on = (e.target as HTMLInputElement).checked;
    if (on) await permissions.grantAll();
    else await permissions.revokeAll();
  }
  async function grantCurrent() {
    if (p.currentOrigin) await permissions.grantOrigin(p.currentOrigin);
  }
  async function revoke(origin: string) {
    await permissions.revokeOrigin(origin);
  }
</script>

<svelte:window on:keydown={onKey} />

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<div class="overlay" on:click={onClose} role="presentation">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
  <div class="card" on:click|stopPropagation role="dialog" aria-label="Settings">
    <div class="head">
      <h2>
        <svg class="title-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1">✕</button>
    </div>

    <h3>Extension</h3>
    <label class="row toggle" title="Master on/off (Shift+Space)">
      <span>Enable HeadMod</span>
      <span class="switch">
        <input type="checkbox" checked={$store.globalEnabled} on:change={toggleGlobal} />
        <span class="slider"></span>
      </span>
    </label>

    <h3>Site access</h3>
    <p class="muted">
      HeadMod only modifies sites you allow. Grant access to all sites, or approve
      individual sites as you go.
    </p>

    <label class="row toggle" title="Allow HeadMod on every site">
      <span>Access on all sites</span>
      <span class="switch">
        <input type="checkbox" checked={p.allUrls} on:change={toggleAll} />
        <span class="slider"></span>
      </span>
    </label>

    {#if !p.allUrls}
      {#if p.currentOrigin && !currentAlreadyGranted}
        <button class="grant" on:click={grantCurrent} tabindex="-1">
          + Grant access to {currentHost}
        </button>
      {/if}

      {#if p.origins.length > 0}
        <h3>Allowed sites</h3>
        <ul>
          {#each p.origins as origin (origin)}
            <li class="row">
              <span class="host">{hostOf(origin)}</span>
              <button class="revoke" on:click={() => revoke(origin)} title="Revoke" tabindex="-1">
                ✕
              </button>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">No individual sites allowed yet.</p>
      {/if}
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
    z-index: 10;
  }
  .card {
    width: 320px;
    max-height: 90vh;
    overflow-y: auto;
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
  h3 {
    margin: 12px 0 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
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
  .muted {
    margin: 0 0 8px;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .toggle {
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    font-size: 13px;
    cursor: pointer;
  }
  .switch {
    position: relative;
    display: inline-flex;
    flex: 0 0 auto;
  }
  .switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: relative;
    width: 34px;
    height: 18px;
    border-radius: 999px;
    background: var(--border);
    transition: background 0.15s ease, box-shadow 0.12s ease;
  }
  .slider::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
    transition: transform 0.15s ease;
  }
  .switch input:checked + .slider {
    background: var(--accent);
  }
  .switch input:checked + .slider::before {
    transform: translateX(16px);
  }
  .switch input:focus-visible + .slider {
    box-shadow: 0 0 0 3px var(--focus-ring);
  }
  .grant {
    margin-top: 8px;
    width: 100%;
    text-align: left;
    border: 1px dashed var(--border);
    background: transparent;
    color: var(--accent);
    border-radius: var(--radius);
    cursor: pointer;
    padding: 8px;
    font-size: 12px;
    transition: background 0.12s ease, border-color 0.12s ease;
  }
  .grant:hover {
    background: var(--surface);
    border-color: var(--accent);
  }
  .empty {
    margin: 8px 0 0;
    padding: 8px;
    border: 1px dashed var(--border);
    border-radius: var(--radius);
    font-size: 12px;
    color: var(--text-muted);
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  li {
    padding: 5px 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 12px;
  }
  .host {
    word-break: break-all;
  }
  .revoke {
    border: none;
    background: transparent;
    color: var(--danger);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    border-radius: var(--radius);
  }
  .revoke:hover {
    background: var(--danger);
    color: #fff;
  }
</style>
