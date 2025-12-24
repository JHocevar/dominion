<script lang="ts">
  import { SignIn, SignOut } from "@auth/sveltekit/components"
  import { page } from "$app/state"
  import { statsState } from "$lib/state/stats.svelte"
  import { kingdomState } from "$lib/state/kingdom.svelte"
  import { saveAll } from "$lib/functions/saving"
  import QRCode from "$lib/components/QRCode.svelte"
  import { PUBLIC_SERVER_URL } from "$env/static/public"

  // Local UI state for actions on the list
  let confirmDeleteIndex = -1
  let editingIndex = -1
  let renameValue = ""

  const requestDelete = (i: number) => {
    confirmDeleteIndex = i
  }

  const cancelDelete = () => {
    confirmDeleteIndex = -1
  }

  const doDelete = (i: number) => {
    // decrement played counts for cards that belong to the kingdom being deleted
    reducePlayedCountsForKingdom(i)

    statsState.playedKingdoms.splice(i, 1)
    confirmDeleteIndex = -1
    saveAll()
  }

  const reducePlayedCountsForKingdom = (i: number) => {
    const entry = statsState.playedKingdoms[i]
    if (!entry) return
    const names: string[] = []
    entry.kingdom.cards.forEach((c) => c?.Name && names.push(c.Name))
    entry.kingdom.extraCards.forEach((c) => c?.Name && names.push(c.Name))

    names.forEach((name) => {
      if (name in statsState.playedCards) {
        const next = Math.max(0, (statsState.playedCards[name] ?? 0) - 1)
        if (next > 0) {
          statsState.playedCards[name] = next
        } else {
          delete statsState.playedCards[name]
        }
      }
    })
  }

  const startRename = (i: number, current?: string) => {
    editingIndex = i
    renameValue = current ?? ""
  }

  const saveRename = (i: number) => {
    if (renameValue?.trim?.() !== "") {
      statsState.playedKingdoms[i].name = renameValue.trim()
    }
    editingIndex = -1
    renameValue = ""
    saveAll()
  }

  const cancelRename = () => {
    editingIndex = -1
    renameValue = ""
  }

  const toggleFavorite = (i: number) => {
    statsState.playedKingdoms[i].favorite = !statsState.playedKingdoms[i].favorite
    saveAll()
  }

  const loadSavedKingdom = (i: number) => {
    const entry = statsState.playedKingdoms[i]
    if (!entry) return
    // replace current kingdom with saved one (make shallow copies)
    kingdomState.cards = [...(entry.kingdom.cards ?? [])]
    kingdomState.extraCards = [...(entry.kingdom.extraCards ?? [])]
  }

  let showQR = false
  let qrAddress = ""

  function openQR(kingdomId: string) {
    qrAddress = `${PUBLIC_SERVER_URL}/generator?kingdomId=${encodeURIComponent(kingdomId)}`
    showQR = true
  }

  function closeQR() {
    showQR = false
    qrAddress = ""
  }
</script>

<h1>Stats</h1>

{#if !page.data.session}
  <div>Sign in to sync settings and stats to the cloud</div>
{/if}

<div class="status">
  <div class="left">
    <div class="indicator" data-online={page.data.session ? "true" : "false"} aria-hidden="true"></div>
    <div class="status-text">
      {#if page.data.session}
        <div class="signedInText">
          <small>Signed in as</small>
          <div class="name">{page.data.session.user?.name ?? "User"}</div>
        </div>
      {:else}
        <div class="notSigned">Not signed in</div>
      {/if}
    </div>
  </div>

  <div class="auth-controls">
    {#if page.data.session}
      <SignOut>
        <div slot="submitButton" class="btn">Sign Out</div>
      </SignOut>
    {:else}
      <SignIn provider="Google">
        <div slot="submitButton" class="btn">Sign in with Google</div>
      </SignIn>
    {/if}
  </div>
</div>

{#each statsState.playedKingdoms as kingdom, index}
  <div class="item">
    <div class="item-body">
      <div class="item-header">
        {#if editingIndex === index}
          <input
            class="rename-input"
            value={renameValue}
            oninput={(e: Event) => (renameValue = (e.target as HTMLInputElement).value)}
          />
          <div class="rename-actions">
            <button class="btn" onclick={() => saveRename(index)}>Save</button>
            <button class="btn" onclick={() => cancelRename()}>Cancel</button>
          </div>
        {:else}
          <div class="item-title">
            {kingdom.name} - {kingdom.date.toLocaleDateString()}
          </div>
        {/if}
      </div>

      {#if confirmDeleteIndex === index}
        <div class="confirm">
          <span>Delete this saved kingdom?</span>
          <div class="confirm-actions">
            <button class="btn btn-warning" onclick={() => doDelete(index)}>Yes</button>
            <button class="btn" onclick={() => cancelDelete()}>No</button>
          </div>
        </div>
      {/if}

      <div class="kingdom">
        {#each kingdom.kingdom.cards as card}
          <div
            class={[
              "card",
              card?.Types.split("-")
                .map((x) => x.trim())
                .join(" ")
                .toLowerCase(),
            ]}
          >
            {card.Name}
          </div>
        {/each}
      </div>

      {#if kingdom.kingdom.extraCards.length > 0}
        <div style="height: 10px;"></div>
        <div class="kingdom">
          {#each kingdom.kingdom.extraCards as card}
            <div
              class={[
                "card",
                card?.Types.split("-")
                  .map((x) => x.trim())
                  .join(" ")
                  .toLowerCase(),
              ]}
            >
              {card.Name}
            </div>
          {/each}
        </div>
      {/if}

      {#if kingdom.kingdom.eventLikeCards.length > 0}
        <div style="height: 10px;"></div>
        <div class="kingdom">
          {#each kingdom.kingdom.eventLikeCards as card}
            <div
              class={[
                "card",
                card?.Types.split("-")
                  .map((x) => x.trim())
                  .join(" ")
                  .toLowerCase(),
              ]}
            >
              {card.Name}
            </div>
          {/each}
        </div>
      {/if}
      <div style="height: 5px;"></div>
      <div style="text-align: center; font-size: var(--font-size-base);">
        {kingdom.kingdom.cards.length} cards, {kingdom.kingdom.extraCards.length} extras, {kingdom.kingdom.eventLikeCards
          .length} events
      </div>
    </div>

    {#if editingIndex !== index}
      <div class="item-controls">
        <span
          class="icon favorite"
          role="button"
          tabindex="0"
          title="Toggle favorite"
          onclick={() => toggleFavorite(index)}
          onkeydown={(e: KeyboardEvent) => (e.key === "Enter" || e.key === " ") && toggleFavorite(index)}
          class:active={kingdom.favorite}
        >
          {kingdom.favorite ? "★" : "☆"}
        </span>

        <span
          class="icon"
          role="button"
          tabindex="0"
          title="Rename"
          onclick={() => startRename(index, kingdom.name)}
          onkeydown={(e: KeyboardEvent) => (e.key === "Enter" || e.key === " ") && startRename(index, kingdom.name)}
        >
          ✏️
        </span>

        <span
          class="icon delete"
          role="button"
          tabindex="0"
          title="Delete"
          onclick={() => requestDelete(index)}
          onkeydown={(e: KeyboardEvent) => (e.key === "Enter" || e.key === " ") && requestDelete(index)}
        >
          ✖
        </span>

        <a
          class="icon load"
          href="/generator"
          title="Load into generator"
          onclick={() => {
            loadSavedKingdom(index)
          }}
        >
          ➤
        </a>
        <span
          class="icon qr"
          role="button"
          tabindex="0"
          title="Show QR code"
          onclick={() => openQR(kingdom.kingdom.kingdomId)}
          onkeydown={(e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && openQR(kingdom.kingdom.kingdomId)}
        >
          📱
        </span>
      </div>
    {/if}
  </div>
{/each}


{#if showQR}
  <QRCode address={qrAddress} onClose={closeQR} />
{/if}

<style>
  :global(.btn) {
    /* keep existing .btn behaviour but ensure smaller on this page */
    padding: 0.45rem 0.7rem;
    font-size: 0.95rem;
  }

  .item {
    border: 1px solid #ccc;
    font-size: var(--font-size-lg);
    padding: 0.5rem;
    border-radius: 4px;
    width: var(--card-width);
    margin: 0.25rem 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
  }

  .item-body {
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .item-controls {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    align-items: center;
    justify-content: center;
    position: absolute;
    right: 0;
  }

  .kingdom {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 5px;
    font-size: var(--font-size-base);
    width: var(--card-width);
  }

  .card {
    border: 1px solid var(--text);
    min-width: calc(var(--card-width) / 5.2);
    text-align: center;
    border-radius: 10px;
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 0.85rem;
    border-radius: 8px;
    background: var(--bg-lighter);
    border: 1px solid var(--text);
    margin: 0.6rem 0 1rem 0;
  }

  .left {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: 6px;
    background: #cfcfcf;
    flex: 0 0 12px;
  }

  .indicator[data-online="true"] {
    background: #2ecc71; /* green when online */
  }

  .status-text {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .signedInText small {
    display: block;
    color: #666;
    font-size: 0.8rem;
  }

  .signedInText .name {
    font-weight: 600;
    line-height: 1;
  }

  .notSigned {
    color: #666;
    font-weight: 500;
  }

  .auth-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Controls layout for each saved item */
  .item {
    align-items: stretch;
  }

  .item-header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 2rem;
    margin: 0 0 0.75rem 0.25rem;
  }

  .item-title {
    font-weight: 600;
    flex: 1 1 auto;
    text-align: left;
  }

  .icon {
    font-size: var(--font-size-lg);
    line-height: 1;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    user-select: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .icon:focus {
    outline: 2px solid rgba(0, 0, 0, 0.06);
  }

  .icon.favorite.active {
    color: #f5c518; /* golden filled star */
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
  }

  .icon.favorite {
    font-size: var(--font-size-xl);
    color: #888; /* empty star color */
  }

  .icon.delete {
    color: #c0392b; /* red X */
  }

  .icon.load {
    color: #2ecc71; /* green load icon */
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .btn-warning {
    background: #c0392b;
  }

  .icon:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  .rename-input {
    flex: 1 1 auto;
    padding: 0.35rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ddd;
  }

  .rename-actions {
    margin-left: 8px;
    display: flex;
    gap: 0.4rem;
  }

  .confirm {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    justify-content: center;
    background: var(--bg);
    top: 0;
    left: 0;
  }

  .confirm-actions button {
    margin-left: 8px;
  }

  @media (max-width: 740px) {
    .card {
      font-size: var(--font-size-sm);
      min-width: calc(var(--card-width) / 3.9);
    }

    .icon {
      font-size: var(--font-size-base);
    }
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
    box-shadow: none;
    background: linear-gradient(45deg, lightgreen 33%, steelblue 34%, steelblue 66%, orange 67%);
  }

  .event {
    box-shadow: inset 0 0 20px 0.25rem #6d7171;
  }

  .landmark {
    box-shadow: inset 0 0 20px 0.25rem darkgreen;
  }

  .way {
    box-shadow: inset 0 0 20px 0.25rem lightskyblue;
  }

  .project {
    box-shadow: inset 0 0 20px 0.25rem lightpink;
  }

  .trait {
    box-shadow: inset 0 0 20px 0.25rem #7978a9;
  }

  .prophecy {
    box-shadow: inset 0 0 20px 0.25rem #30a4bd;
  }

  .ally {
    box-shadow: inset 0 0 20px 0.25rem #ada285;
  }
</style>
