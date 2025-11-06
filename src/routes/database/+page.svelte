<script lang="ts">
  import { settingsState, saveSettings } from '$lib/state/settings.svelte'
  import type { PageProps } from "./$types"
  import type { Card } from '$lib/functions/cards'
  let { data }: PageProps = $props()

  let filter = $state("")

  const toggleBanned = (card: Card) => {
    if (settingsState.bannedCards.includes(card.Name)) {
      settingsState.bannedCards.splice(settingsState.bannedCards.indexOf(card.Name), 1)
    } else {
      settingsState.bannedCards.push(card.Name)
    }
    saveSettings()
  }
</script>

<h1>Dominion Cards</h1>

<div class="filter-row">
  <label for="card-filter" class="filter-label">Filter:</label>
  <input
    id="card-filter"
    class="input"
    bind:value={filter}
    placeholder="Search cards by name"
  />
</div>

{#each data.allCards as card}
  {#if card.Name.toLowerCase().includes(filter.toLowerCase())}
    <div class="card">
      <h2>{card.Name}</h2>
      <p><strong>Set:</strong> {card.Set}</p>
      <p><strong>Types:</strong> {card.Types}</p>
      <p><strong>Cost:</strong> {card.Cost}</p>
      <p><string>Actions</string> {card.Actions}</p>
      <p><strong>Text:</strong> {card.Text}</p>
      <button
        class="btn btn-primary btn-ban"
        class:banned={settingsState.bannedCards.includes(card.Name)}
        onclick={() => toggleBanned(card)}
      >
        {settingsState.bannedCards.includes(card.Name) ? "Banned" : "In Use"}
      </button>
    </div>
  {/if}
{/each}

<style>
  .card {
    border: 1px solid #ccc;
    padding: var(--spacing-base);
    border-radius: 4px;
    width: var(--card-width);
    margin: var(--spacing-base) 0;
    position: relative;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .filter-label {
    font-weight: bold;
  }

  .btn-ban {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .banned {
    background: #ff4444;
  }
</style>
