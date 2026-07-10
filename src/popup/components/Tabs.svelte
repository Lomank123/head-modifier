<script lang="ts">
  export let tabs: string[];
  export let active: string;
  export let onSelect: (tab: string) => void;
</script>

<div class="tabs">
  {#each tabs as tab}
    <button class:active={tab === active} on:click={() => onSelect(tab)}>{tab}</button>
  {/each}
</div>

<style>
  .tabs {
    display: flex;
    border-bottom: 1px solid var(--border);
  }
  button {
    flex: 1;
    padding: 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--text-muted);
    font-size: 13px;
    border-bottom: 2px solid transparent;
  }
  button.active {
    color: var(--text);
    border-bottom-color: var(--accent);
    font-weight: 600;
  }
</style>
