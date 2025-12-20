<script lang="ts">
  import { saveAll } from "$lib/functions/saving"
  import { settingsState } from "$lib/state/settings.svelte"
  import { kingdomState } from "$lib/state/kingdom.svelte"
  import { type Card, loadAllSupplyCards } from "$lib/functions/cards"
  import { loadAllCards } from "$lib/functions/cards"
  import { getAvailableCards, getAvailableEventLikeCards } from "$lib/functions/generator"
  import { statsState } from "$lib/state/stats.svelte"

  let filter = $state("")
  let bannedOnly = $state(false)
  let availableOnly = $state(false)
  let supplyOnly = $state(false)

  const toggleBanned = (card: Card) => {
    if (settingsState.bannedCards.includes(card.Name)) {
      settingsState.bannedCards.splice(
        settingsState.bannedCards.indexOf(card.Name),
        1,
      )
    } else {
      settingsState.bannedCards.push(card.Name)
    }
    saveAll()
  }

  let allCards = $derived(loadAllCards())
  let cards: Card[] = $derived.by(() => {
    let cards = allCards
    if (bannedOnly) {
      cards = cards.filter((card) =>
        settingsState.bannedCards.includes(card.Name),
      )
    }
    if (availableOnly) {
      const availableCards = getAvailableCards()
      cards = cards.filter((card) =>
        availableCards.some((c) => c.Name == card.Name),
      )
    }
    if (supplyOnly) {
      const supplyOnly = loadAllSupplyCards()
      cards = cards.filter((card) =>
        supplyOnly.some((c) => c.Name == card.Name),
      )
    }
    return cards
  })

  const addCardToKingdom = (card: Card) => {
    const availableCards = getAvailableCards()
    if (availableCards.some((c) => c.Name === card.Name)) {
      kingdomState.cards.push(card)
      saveAll()
    }

    const availableEventLikeCards = getAvailableEventLikeCards()
    if (availableEventLikeCards.some((c) => c.Name === card.Name)) {
      kingdomState.eventLikeCards.push(card)
      saveAll()
    }
  }
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
  <button
    class="btn"
    class:on={bannedOnly}
    onclick={() => (bannedOnly = !bannedOnly)}>Banned</button
  >
  <button
    class="btn"
    class:on={availableOnly}
    onclick={() => (availableOnly = !availableOnly)}>Available</button
  >
  <button
    class="btn"
    class:on={supplyOnly}
    onclick={() => (supplyOnly = !supplyOnly)}>Supply</button
  >
</div>

<div class="filter-row">{cards.length}/{allCards.length} cards shown</div>

{#each cards as card}
  {#if card.Name.toLowerCase().includes(filter.toLowerCase())}
    <div
      class={[
        "card",
        card?.Types.split("-")
          .map((x) => x.trim())
          .join(" ")
          .toLowerCase(),
      ]}
    >
      <h2>{card.Name} <span class="set">{card.Set}</span></h2>
      <div><strong>{card.Types}</strong></div>
      <br />
      <div>{card.Text}</div>
      <button
        class="btn btn-primary btn-add"
        class:banned={kingdomState.cards.some(c => c.Name === card.Name) || kingdomState.eventLikeCards.some(c => c.Name === card.Name)}
        onclick={() => addCardToKingdom(card)}
      >
        Add to Kingdom
      </button>
      <button
        class="btn btn-primary btn-ban"
        class:banned={settingsState.bannedCards.includes(card.Name)}
        onclick={() => toggleBanned(card)}
      >
        {settingsState.bannedCards.includes(card.Name) ? "Banned" : "In Use"}
      </button>
      {#if card.Name in statsState.playedCards}
        <div class="played-count">
          Played count: <strong>{statsState.playedCards[card.Name]}</strong>
        </div>
      {/if}
    </div>
  {/if}
{/each}

<style>
  h2 {
    margin: 0 0 0.5rem 0;
  }

  .card {
    border: 1px solid #ccc;
    padding: var(--spacing-base);
    border-radius: 4px;
    width: var(--card-width);
    margin: 0.25rem 0;
    position: relative;
  }

  .set {
    font-size: 0.5em;
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

  .btn-add {
    position: absolute;
    top: 1rem;
    right: 7rem;
  }

  @media (max-width: 740px) {
    .btn-add {
      right:  5rem;
    }
  }

  .played-count {
    position: absolute;
    top: 3.5rem;
    right: 1rem;
  }

  .banned {
    background: #ff4444;
  }

  .action {
    box-shadow: inset 0 0 20px 0.25rem lightgrey;
  }

  .attack {
    box-shadow: inset 0 0 20px 0.25rem red;
  }

  .reaction {
    box-shadow: inset 0 0 20px 0.25rem steelblue;
  }

  .duration {
    box-shadow: inset 0 0 20px 0.25rem orange;
  }

  .victory {
    box-shadow: inset 0 0 20px 0.25rem lightgreen;
  }

  .treasure {
    box-shadow: inset 0 0 20px 0.25rem yellow;
  }

  .reserve {
    box-shadow: inset 0 0 20px 0.25rem tan;
  }

  .reaction.duration {
    box-shadow:
      inset 0 0 10px 4px steelblue,
      inset 0 0 30px 0.25rem orange;
  }

  .treasure.victory {
    box-shadow:
      inset 0 0 10px 4px gold,
      inset 0 0 30px 0.25rem lightgreen;
  }

  .treasure.duration {
    box-shadow:
      inset 0 0 10px 4px yellow,
      inset 0 0 30px 0.25rem orange;
  }

  .action.victory {
    box-shadow:
      inset 0 0 10px 4px lightgrey,
      inset 0 0 30px 0.25rem lightgreen;
  }

  .victory.treasure {
    box-shadow:
      inset 0 0 10px 4px lightgreen,
      inset 0 0 30px 0.25rem gold;
  }

  .victory.reaction.duration {
    background: linear-gradient(
      45deg,
      lightgreen 33%,
      steelblue 34%,
      steelblue 66%,
      orange 67%
    );
  }
</style>
