<script lang="ts">
  import type { Profile } from '../../types';

  export let profiles: Profile[];
  export let activeProfileId: string;
  export let onSelect: (id: string) => void;
  export let onEdit: (id: string) => void;
  export let onDelete: (id: string) => void;

  $: active = profiles.find((p) => p.id === activeProfileId);
  $: canDelete = profiles.length > 1;

  let open = false;

  function close() {
    open = false;
  }
  function toggle() {
    open = !open;
  }
  function pick(id: string) {
    onSelect(id);
    close();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={onKey} />

<div class="wrap">
  <button
    class="trigger"
    class:open
    on:click={toggle}
    title="Active profile"
    aria-haspopup="listbox"
    aria-expanded={open}
    tabindex="-1"
  >
    <span class="name">{active?.name ?? 'Profile'}</span>
    <svg
      class="chevron"
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  {#if open}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div class="backdrop" on:click={close} role="presentation"></div>
    <div class="menu" role="listbox" aria-label="Profiles">
      {#each profiles as profile (profile.id)}
        <div class="row" class:active={profile.id === activeProfileId}>
          <button
            class="pick"
            role="option"
            aria-selected={profile.id === activeProfileId}
            on:click={() => pick(profile.id)}
            tabindex="-1"
          >
            {#if profile.id === activeProfileId}
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            {:else}
              <span class="check-spacer"></span>
            {/if}
            <span class="profile-name">{profile.name}</span>
          </button>
          <div class="row-actions">
            <button
              class="icon"
              title="Rename profile"
              on:click|stopPropagation={() => onEdit(profile.id)}
              tabindex="-1"
              aria-label="Rename {profile.name}"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
            <button
              class="icon danger"
              title={canDelete ? 'Delete profile' : 'Cannot delete the only profile'}
              disabled={!canDelete}
              on:click|stopPropagation={() => onDelete(profile.id)}
              tabindex="-1"
              aria-label="Delete {profile.name}"
            >
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .wrap {
    position: relative;
    flex: 0 1 110px;
    max-width: 110px;
    min-width: 0;
  }
  .trigger {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    height: 26px;
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
    text-align: left;
    transition: border-color 0.12s ease, background-color 0.12s ease;
  }
  .trigger:hover,
  .trigger.open {
    border-color: var(--accent);
    background: var(--surface);
  }
  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chevron {
    flex: 0 0 auto;
    color: var(--text-muted);
    transition: transform 0.15s ease;
  }
  .trigger.open .chevron {
    transform: rotate(180deg);
  }
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 20;
  }
  .menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 21;
    width: 180px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 2px;
    border-radius: var(--radius);
  }
  .row.active {
    background: var(--surface);
  }
  .row:hover {
    background: var(--surface);
  }
  .pick {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 4px 6px 6px;
    border: none;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    font-size: 12px;
    text-align: left;
  }
  .pick svg {
    flex: 0 0 auto;
    color: var(--accent);
  }
  .check-spacer {
    flex: 0 0 auto;
    width: 12px;
  }
  .profile-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 2px;
    padding-right: 4px;
  }
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }
  .icon:hover:not(:disabled) {
    background: var(--border);
    color: var(--text);
  }
  .icon.danger:hover:not(:disabled) {
    background: var(--danger);
    color: #fff;
  }
  .icon:disabled {
    opacity: 0.35;
    cursor: default;
  }
</style>
