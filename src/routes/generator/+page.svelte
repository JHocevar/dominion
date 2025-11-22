<script lang="ts">
  import { generateKingdon, rerollOneCard, rerollOneEventLikeCard } from "$lib/functions/generator"
  import { saveAll } from "$lib/functions/saving"
  import { kingdomState, type Kingdom } from "$lib/state/kingdom.svelte"
  import { statsState } from "$lib/state/stats.svelte"
  import { onMount } from "svelte"

  const fullKingdom = $derived([...kingdomState.cards, ...kingdomState.eventLikeCards, ...kingdomState.extraCards])

  const kingdomKey = (k: Kingdom) => {
    const names = [...k.cards.map((c) => c.Name), ...k.extraCards.map((c) => c.Name)]
    names.sort()
    return names.join("|")
  }

  // Derived `saved` value — true when the current kingdom matches any saved kingdom.
  const saved = $derived.by(() => {
    try {
      const currentKey = kingdomKey(kingdomState)
      const x = statsState.playedKingdoms.some((entry) => kingdomKey(entry.kingdom) === currentKey)
      return x
    } catch (e) {
      return false
    }
  })

  const dayName = (date: Date, locale?: Intl.LocalesArgument) => date.toLocaleDateString(locale, { weekday: "long" })

  const saveKingdom = () => {
    const date = new Date()
    statsState.playedKingdoms.push({
      date: date,
      name: dayName(date),
      kingdom: JSON.parse(JSON.stringify(kingdomState)),
      favorite: false,
    })
    fullKingdom.forEach((card) => {
      if (card.Name in statsState.playedCards) {
        statsState.playedCards[card.Name] += 1
      } else {
        statsState.playedCards[card.Name] = 1
      }
    })
    saveAll()
  }

  // Reset / clear kingdom flow
  let showResetConfirm = $state(false)

  const clearKingdom = () => {
    kingdomState.cards = []
    kingdomState.extraCards = []
    kingdomState.eventLikeCards = []
    kingdomState.extraMappings = {}
    saveAll()
    showResetConfirm = false
  }
</script>

<h1>Kingdom Generator</h1>

<div class="wrapper">
  {#if kingdomState.cards.length > 1 || kingdomState.eventLikeCards.length > 0}
    <button
      class="btn btn-secondary clear-button"
      onclick={() => (showResetConfirm = true)}
      aria-haspopup="dialog"
      style="margin-bottom: 10px; padding: .75rem 1.25rem;"
    >
      Clear
    </button>
  {/if}

  <button
    class="btn btn-primary"
    onclick={() => generateKingdon()}
    style="margin-bottom: 10px; padding: .75rem 1.25rem;"
  >
    New Kingdom
  </button>

  <div class="link-to-settings"><a href="/settings">⚙️</a></div>
</div>

{#if showResetConfirm}
  <div class="modal-overlay" role="dialog" aria-modal="true" aria-label="Confirm clear kingdom">
    <div class="modal">
      <h2>Clear current kingdom?</h2>
      <p>This will remove all cards, events and extra mappings. This cannot be undone.</p>
      <div class="modal-actions">
        <button class="btn" onclick={() => (showResetConfirm = false)}>Cancel</button>
        <button class="btn btn-danger" onclick={() => clearKingdom()}>Confirm Clear</button>
      </div>
    </div>
  </div>
{/if}

{#each fullKingdom as card}
  <div
    class={[
      "card",
      card?.Types.split("-")
        .map((x) => x.trim())
        .join(" ")
        .toLowerCase(),
      kingdomState.extraMappings[card.Name] ? `trait-card` : ``,
    ]}
  >
    <div class="left">
      <span class="name">{card.Name}</span>
      <span class="set">{card.Set}</span>
      {#if kingdomState.extraMappings[card.Name]}
        <span class="trait-name">{kingdomState.extraMappings[card.Name].split("-")[1]}</span>
      {/if}
    </div>
    {#if kingdomState.cards.includes(card)}
      <div class="right">
        <button class="reroll" onclick={() => rerollOneCard(card)}>🎲</button>
      </div>
    {:else if kingdomState.eventLikeCards.includes(card)}
      <div class="right">
        <button class="reroll" onclick={() => rerollOneEventLikeCard(card)}>🎲</button>
      </div>
    {/if}
  </div>
{/each}

{#if kingdomState.cards.length > 0 || kingdomState.eventLikeCards.length > 0}
  <div>
    {kingdomState.cards.length} cards, {kingdomState.extraCards.length} extras, {kingdomState.eventLikeCards
      .length} events
  </div>
{/if}

{#if kingdomState.cards.length >= 10}
  <br />
  <button
    class="btn btn-primary"
    style="margin-bottom: 10px; padding: .75rem 1.25rem;"
    onclick={() => saveKingdom()}
    disabled={saved}
  >
    Save Kingdom
  </button>
{/if}

<style>
  .card {
    color: black;
    padding: 0.25rem;
    font-size: 1.5rem;
    border-radius: 4px;
    width: var(--card-width);
    max-width: var(--card-width);
    margin: 0.25rem 0;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .reroll {
    padding: 2px;
    font-size: 1.25rem;
    width: 35px;
    height: 35px;
  }

  .wrapper {
    position: relative;
    width: var(--card-width);
    text-align: center;
  }

  .link-to-settings {
    position: absolute;
    right: 0;
    top: 0;
    font-size: var(--font-size-xl);
  }

  .clear-button {
    position: absolute;
    margin-left: 0;
    left: 0;
    top: 0;
  }

  a {
    text-decoration: none;
  }

  /* primary button styling moved to global +layout.css as .btn and .btn-primary */

  .set {
    font-size: 0.9rem;
    font-style: italic;
  }

  .trait-name {
    font-size: 0.9rem;
    font-style: italic;
    font-weight: bold;
    margin-left: 0.5rem;
  }

  .action {
    background: lightgrey;
  }

  .attack {
    box-shadow: inset 0 0 8px 0.15em red;
  }

  .reaction {
    background: steelblue;
  }

  .duration {
    background: orange;
  }

  .victory {
    background: lightgreen;
  }

  .treasure {
    background: yellow;
  }

  .reserve {
    background: tan;
  }

  .night {
    background: black;
    color: white;
  }

  .liaison {
    box-shadow: inset 0 0 12px 0.25em #ada285;
  }

  .reaction.duration {
    background: linear-gradient(45deg, steelblue 49%, orange 51%);
  }

  .treasure.victory {
    background: linear-gradient(45deg, gold 49%, lightgreen 51%);
  }

  .treasure.duration {
    background: linear-gradient(45deg, yellow 49%, orange 51%);
  }

  .action.victory {
    background: linear-gradient(45deg, lightgrey 49%, lightgreen 51%);
  }

  .victory.treasure {
    background: linear-gradient(45deg, lightgreen 49%, gold 51%);
  }

  .victory.reaction.duration {
    background: linear-gradient(45deg, lightgreen 33%, steelblue 34%, steelblue 66%, orange 67%);
  }

  .event {
    background: #6d7171;
  }

  .landmark {
    background: darkgreen;
  }

  .way {
    background: lightskyblue;
  }

  .project {
    background: lightpink;
  }

  .ally {
    background: #ada285
  }

  .trait {
    background: #7978a9;
  }

  .trait-card {
    box-shadow: inset 0 0 16px 0.2em #7978a9;
  }

  .prophecy {
    background: #30a4bd;
  }

  /* Modal styles for clear confirmation */
  .modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45);
    z-index: 1200;
    padding: 1rem;
  }

  .modal {
    background: var(--bg);
    color: var(--text);
    padding: 1.25rem;
    border-radius: 8px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-secondary {
    background: #777;
    color: white;
  }

  .btn-danger {
    background: #c62828;
    color: white;
  }
</style>
