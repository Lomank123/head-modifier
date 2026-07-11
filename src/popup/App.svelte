<script lang="ts">
  import { store } from '../state/store';
  import { getActiveProfile } from '../state/operations';
  import { permissions } from '../state/permissions';
  import { arrowNav } from './actions/arrowNav';
  import TopBar from './components/TopBar.svelte';
  import RuleList from './components/RuleList.svelte';
  import GrantPrompt from './components/GrantPrompt.svelte';

  $: document.documentElement.setAttribute('data-theme', $store.theme);
  $: profile = getActiveProfile($store);
  $: granted = $permissions.currentGranted;
</script>

<main use:arrowNav>
  <TopBar state={$store} restricted={!granted} />

  {#if granted && profile}
    <div class="body">
      <RuleList section="headers" label="Headers" rows={profile.headers} />
      <RuleList section="cookies" label="Cookies" rows={profile.cookies} />
    </div>
  {:else}
    <GrantPrompt />
  {/if}
</main>

<style>
  .body {
    max-height: 460px;
    overflow-y: auto;
  }
</style>
