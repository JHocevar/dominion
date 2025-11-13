<script lang="ts">
  import { generateKingdon, rerollOneCard } from "$lib/functions/generator"
  import { kingdomState } from "$lib/state/kingdom.svelte"

  const fullKingdom = $derived([
    ...kingdomState.cards,
    ...kingdomState.extraCards,
  ])
</script>

<h1>Kingdom Generator</h1>

<button
  class="btn btn-primary"
  onclick={() => generateKingdon()}
  style="margin-bottom: 10px;"
>
  New Kingdom
</button>

{#each fullKingdom as card}
  <div
    class={[
      "card",
      card?.Types.split("-")
        .map((x) => x.trim())
        .join(" ")
        .toLowerCase(),
    ]}
  >
    <div class="left">
      <span class="name">{card.Name}</span>
      <span class="set">{card.Set}</span>
    </div>
    {#if kingdomState.cards.includes(card)}
      <div class="right">
        <button class="reroll" onclick={() => rerollOneCard(card)}>🎲</button>
      </div>
    {/if}
  </div>
{/each}

<style>
  .card {
    border: 1px solid var(--muted);
    color: black;
    padding: 0.25rem;
    font-size: 1.5rem;
    border-radius: 4px;
    width: 600px;
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

  /* primary button styling moved to global +layout.css as .btn and .btn-primary */

  .set {
    font-size: 0.9rem;
    font-style: italic;
  }

  .action {
    background: lightgrey;
  }

  .attack {
    border: 2px solid red;
    box-shadow: inset 0 0 8px .15em red;
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
    background: linear-gradient(45deg, lightgreen 33%, steelblue 34%, steelblue 66%, orange 67%)
  }
</style>
