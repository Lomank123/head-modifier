<script lang="ts">
  import { permissions, hostOf } from '../../state/permissions';

  $: p = $permissions;
  $: host = p.currentOrigin ? hostOf(p.currentOrigin) : undefined;

  async function grantSite() {
    if (p.currentOrigin) await permissions.grantOrigin(p.currentOrigin);
  }
  async function grantAll() {
    await permissions.grantAll();
  }
</script>

<div class="prompt">
  <div class="icon">
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  </div>
  {#if !p.loaded}
    <p class="muted">Checking access…</p>
  {:else}
    <h2>Grant access to start</h2>
    <p class="muted">
      HeadMod needs permission to modify requests before it can inject anything on this site.
    </p>
    {#if host}
      <button class="primary" on:click={grantSite}>Grant access to {host}</button>
      <button class="link" on:click={grantAll}>Enable on all sites instead</button>
    {:else}
      <p class="muted">This page can’t be modified (not an http/https site).</p>
      <button class="link" on:click={grantAll}>Enable on all sites</button>
    {/if}
  {/if}
</div>

<style>
  .prompt {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 20px;
    text-align: center;
  }
  .icon {
    display: flex;
    color: var(--text-muted);
    margin-bottom: 4px;
  }
  h2 {
    margin: 0;
    font-size: 15px;
  }
  .muted {
    margin: 0;
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.4;
    max-width: 260px;
  }
  .primary {
    margin-top: 4px;
    border: 1px solid var(--accent);
    background: var(--accent);
    color: #fff;
    border-radius: var(--radius);
    cursor: pointer;
    padding: 7px 14px;
    font-size: 13px;
    transition: opacity 0.12s ease;
  }
  .primary:hover {
    opacity: 0.9;
  }
  .link {
    border: none;
    background: transparent;
    color: var(--accent);
    cursor: pointer;
    font-size: 12px;
    padding: 2px;
    text-decoration: underline;
  }
</style>
