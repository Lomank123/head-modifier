<script lang="ts">
  import { store } from '../state/store';
  import { getActiveProfile } from '../state/operations';
  import TopBar from './components/TopBar.svelte';
  import RuleList from './components/RuleList.svelte';

  $: document.documentElement.setAttribute('data-theme', $store.theme);
  $: profile = getActiveProfile($store);
</script>

<TopBar state={$store} />

{#if profile}
  <div class="body">
    <RuleList section="headers" label="Headers" rows={profile.headers} />
    <RuleList section="cookies" label="Cookies" rows={profile.cookies} />
  </div>
{/if}

<style>
  .body {
    max-height: 460px;
    overflow-y: auto;
  }
</style>
