<script lang="ts">
  import { permissions, hostOf } from '../../state/permissions';

  export let onClose: () => void;

  $: p = $permissions;
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
      <h2>Settings</h2>
      <button class="close" on:click={onClose} title="Close" tabindex="-1">✕</button>
    </div>

    <h3>Site access</h3>
    <p class="muted">
      HeadMod only modifies sites you allow. Grant access to all sites, or approve
      individual sites as you go.
    </p>

    <label class="row toggle" title="Allow HeadMod on every site">
      <span>Access on all sites</span>
      <input type="checkbox" checked={p.allUrls} on:change={toggleAll} />
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
    margin: 0;
    font-size: 15px;
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
