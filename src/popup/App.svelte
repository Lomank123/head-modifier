<script lang="ts">
  import { store } from '../state/store';
  import { addRow, getActiveProfile, setGlobalEnabled } from '../state/operations';
  import { permissions } from '../state/permissions';
  import { arrowNav } from './actions/arrowNav';
  import TopBar from './components/TopBar.svelte';
  import RuleList from './components/RuleList.svelte';
  import GrantPrompt from './components/GrantPrompt.svelte';
  import InfoPanel from './components/InfoPanel.svelte';
  import SettingsPanel from './components/SettingsPanel.svelte';
  import ShortcutsPanel from './components/ShortcutsPanel.svelte';

  $: document.documentElement.setAttribute('data-theme', $store.theme);
  $: profile = getActiveProfile($store);
  $: granted = $permissions.currentGranted;

  let showInfo = false;
  let showSettings = false;
  let showShortcuts = false;
  let topBar: TopBar;

  function isEditable(el: EventTarget | null): boolean {
    const node = el as HTMLElement | null;
    return (
      !!node &&
      (node.tagName === 'INPUT' ||
        node.tagName === 'TEXTAREA' ||
        node.tagName === 'SELECT' ||
        node.isContentEditable)
    );
  }

  function onKeydown(e: KeyboardEvent) {
    // Undo / redo — available globally, even while editing a field.
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.code === 'KeyZ' || e.code === 'KeyY')) {
      e.preventDefault();
      if (e.code === 'KeyY' || e.shiftKey) store.redo();
      else store.undo();
      return;
    }

    // Shift shortcuts — ignored while typing in a field or when access isn't granted.
    if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (isEditable(e.target)) return;

    if (!granted) return;
    switch (e.code) {
      case 'KeyH':
        e.preventDefault();
        store.apply((s) => addRow(s, 'headers', 'request'), true, true);
        break;
      case 'KeyC':
        e.preventDefault();
        store.apply((s) => addRow(s, 'cookies', 'request'), true, true);
        break;
      case 'KeyP':
        e.preventDefault();
        topBar?.openCreateProfileModal();
        break;
      case 'Space':
        e.preventDefault();
        store.apply((s) => setGlobalEnabled(s, !s.globalEnabled), true);
        break;
    }
  }
</script>

<svelte:window on:keydown={onKeydown} />

<main use:arrowNav>
  <TopBar
    bind:this={topBar}
    state={$store}
    restricted={!granted}
    onOpenInfo={() => (showInfo = true)}
    onOpenSettings={() => (showSettings = true)}
    onOpenShortcuts={() => (showShortcuts = true)}
  />

  {#if granted && profile}
    <div class="body">
      <RuleList section="headers" label="Headers" rows={profile.headers} />
      <RuleList section="cookies" label="Cookies" rows={profile.cookies} />
    </div>
  {:else}
    <GrantPrompt />
  {/if}
</main>

{#if showInfo}
  <InfoPanel onClose={() => (showInfo = false)} />
{/if}
{#if showSettings}
  <SettingsPanel onClose={() => (showSettings = false)} />
{/if}
{#if showShortcuts}
  <ShortcutsPanel onClose={() => (showShortcuts = false)} />
{/if}

<style>
  .body {
    max-height: 460px;
    overflow-y: auto;
  }
</style>
