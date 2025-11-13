<script lang="ts">
  import { settingsState, saveSettings } from '$lib/state/settings.svelte'
  import { type Card, loadAllSupplyCards } from '$lib/functions/cards'
  import { loadAllCards } from '$lib/functions/cards'
  import { getAvailableCards } from '$lib/functions/generator'

  let filter = $state("")
  let bannedOnly = $state(false)
  let availableOnly = $state(false)
  let supplyOnly = $state(false)

  const toggleBanned = (card: Card) => {
    if (settingsState.bannedCards.includes(card.Name)) {
      settingsState.bannedCards.splice(settingsState.bannedCards.indexOf(card.Name), 1)
    } else {
      settingsState.bannedCards.push(card.Name)
    }
    saveSettings()
  }

  let allCards = $derived(loadAllCards())
  let cards: Card[] = $derived.by(() => {
    let cards = allCards
    if (bannedOnly) {
      cards = cards.filter((card) => settingsState.bannedCards.includes(card.Name))
    }
    if (availableOnly) {
      const availableCards = getAvailableCards()
      cards = cards.filter((card) => availableCards.some((c) => c.Name == card.Name))
    }
    if (supplyOnly) {
      const supplyOnly = loadAllSupplyCards()
      cards = cards.filter((card) => supplyOnly.some((c) => c.Name == card.Name))
    }
    return cards
  })

</script>

<h1>Dominion Cards</h1>

<div class="filter-row">
  <label for="card-filter" class="filter-label">Search:</label>
  <input
    id="card-filter"
    class="input"
    bind:value={filter}
    placeholder="Search cards by name"
  />
</div>

<div class="filter-row">
  <button class="btn" class:on={bannedOnly} onclick={() => bannedOnly = !bannedOnly}>Banned</button>
  <button class="btn" class:on={availableOnly} onclick={() => availableOnly = !availableOnly}>Available</button>
  <button class="btn" class:on={supplyOnly} onclick={() => supplyOnly = !supplyOnly}>Supply</button>
</div>

<div class="filter-row">{cards.length}/{allCards.length} cards shown</div>

{#each cards as card}
  {#if card.Name.toLowerCase().includes(filter.toLowerCase())}
    <div class="card">
      <h2>{card.Name} <span class="set">{card.Set}</span></h2>
      <div><strong>{card.Types}</strong></div>
      <br />
      <div>{card.Text}</div>
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
  h2 {
    margin: 0 0 .5rem 0;
  }

  .card {
    border: 1px solid #ccc;
    padding: var(--spacing-base);
    border-radius: 4px;
    width: var(--card-width);
    margin: .25rem 0;
    position: relative;
  }

  .set {
    font-size: .5em;
    font-style: italic;
  }

  .on {
    background: var(--color-primary);
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
