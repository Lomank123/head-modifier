<script lang="ts">
  import { store } from '../state/store';
  import { getActiveProfile } from '../state/operations';
  import TopBar from './components/TopBar.svelte';
  import Tabs from './components/Tabs.svelte';
  import RuleList from './components/RuleList.svelte';

  let activeTab = 'Headers';
  $: document.documentElement.setAttribute('data-theme', $store.theme);
  $: profile = getActiveProfile($store);
</script>

<TopBar state={$store} />
<Tabs tabs={['Headers', 'Cookies']} active={activeTab} onSelect={(t) => (activeTab = t)} />

{#if profile}
  {#if activeTab === 'Headers'}
    <RuleList section="headers" rows={profile.headers} />
  {:else}
    <RuleList section="cookies" rows={profile.cookies} />
  {/if}
{/if}
