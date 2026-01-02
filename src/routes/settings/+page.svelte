<script lang="ts">
  import { settingsState } from "$lib/state/settings.svelte"
  import { saveAll } from "$lib/functions/saving"
  import { MediaQuery } from "svelte/reactivity"

  let showAdvanced = $state(false)

  function toggleAllAdvanced() {
    showAdvanced = !showAdvanced
  }

  let bigEnough = new MediaQuery("min-width: 375px")

  // percentage display helpers (store whole numbers for the inputs)
  let platinumPercent = $derived(Math.round(settingsState.platinumChance * 100))
  let platinumNoCardsPercent = $derived(Math.round(settingsState.platinumChanceNoCards * 100))
  let shelterPercent = $derived(Math.round(settingsState.shelterChance * 100))
  let shelterNoCardsPercent = $derived(Math.round(settingsState.shelterChanceNoCards * 100))
</script>

<h1>Settings</h1>

<div class="btn btn-primary" style="padding: .75rem;">
  <a href="/generator">Looks good - Let's generate!</a>
</div>

<!-- Card Sets Banner and Advanced Settings Button -->
<div class="header-container">
  <h2>Card Sets</h2>
  <button
    class="icon-button"
    onclick={toggleAllAdvanced}
    class:open={showAdvanced}
    aria-label="Toggle all advanced settings"
  >
    ⚙️
  </button>
</div>

<!-- Card Sets -->
{#each Object.entries(settingsState.sets) as [key, set]}
  {#if !settingsState.sets[key].hidden}
    <div class="item">
      <div class="item-header">
        <span>{set.name}</span>
        {#if !showAdvanced || bigEnough.current}
          <div class={["button-group", showAdvanced ? "column" : "row"]}>
            {#if set.secondEdition}
              <button
                class="btn btn-primary btn-settings btn-small"
                class:enabled={settingsState.sets[key].secondEditionEnabled}
                disabled={settingsState.sets[key].enabled === false}
                onclick={(e) => {
                  e.preventDefault()
                  settingsState.sets[key].secondEditionEnabled = !settingsState.sets[key].secondEditionEnabled
                  saveAll()
                }}
              >
                {settingsState.sets[key].secondEditionEnabled ? "2nd" : "1st"}
              </button>
            {/if}
            <button
              class="btn btn-primary btn-settings"
              class:enabled={settingsState.sets[key].enabled}
              onclick={() => {
                settingsState.sets[key].enabled = !settingsState.sets[key].enabled
                saveAll()
              }}
            >
              {settingsState.sets[key].enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        {/if}
      </div>
      {#if showAdvanced}
        <div class="advanced-settings">
          <div class="setting-row">
            <label for={`weight-${key}`}>Weight:</label>
            <input
              class="input"
              id={`weight-${key}`}
              disabled={!settingsState.sets[key].enabled}
              type="number"
              min="0"
              onchange={saveAll}
              bind:value={settingsState.sets[key].weight}
            />
          </div>
          <div class="setting-row">
            <label for={`minCards-${key}`}>Min Cards:</label>
            <input
              class="input"
              id={`minCards-${key}`}
              disabled={!settingsState.sets[key].enabled}
              type="number"
              min="0"
              onchange={saveAll}
              bind:value={settingsState.sets[key].minCards}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
{/each}

<h2>Generation Rules</h2>

<!-- Banned Card Notification -->
<div>
  <span style="color: red;">{settingsState.bannedCards.length}</span>
  <span>banned cards. Update in the</span>
  <button class="btn btn-primary"><a href="/database">Database</a></button>
</div>

<!-- Platinum and Colony -->
<div class="item">
  <span> Platinum / Colony % per card </span>
  <div style="display:flex; align-items:center; gap:0.5rem;">
    <input
      class="input"
      type="number"
      min="0"
      max="100"
      bind:value={platinumPercent}
      onchange={() => {
        settingsState.platinumChance = Number(platinumPercent) / 100
        saveAll()
      }}
    />
    <span>%</span>
  </div>
</div>
<div class="item">
  <span> Platinum / Colony % with 0 cards </span>
  <div style="display:flex; align-items:center; gap:0.5rem;">
    <input
      class="input"
      type="number"
      min="0"
      max="100"
      bind:value={platinumNoCardsPercent}
      onchange={() => {
        settingsState.platinumChanceNoCards = Number(platinumNoCardsPercent) / 100
        saveAll()
      }}
    />
    <span>%</span>
  </div>
</div>

<!-- Shelters -->
<div class="item">
  <span> Shelters % per card </span>
  <div style="display:flex; align-items:center; gap:0.5rem;">
    <input
      class="input"
      type="number"
      min="0"
      max="100"
      bind:value={shelterPercent}
      onchange={() => {
        settingsState.shelterChance = Number(shelterPercent) / 100
        saveAll()
      }}
    />
    <span>%</span>
  </div>
</div>
<div class="item">
  <span> Shelters % with 0 cards </span>
  <div style="display:flex; align-items:center; gap:0.5rem;">
    <input
      class="input"
      type="number"
      min="0"
      max="100"
      bind:value={shelterNoCardsPercent}
      onchange={() => {
        settingsState.shelterChanceNoCards = Number(shelterNoCardsPercent) / 100
        saveAll()
      }}
    />
    <span>%</span>
  </div>
</div>

<!-- Required or Disabled Cards -->
<div class="item">
  <span>Require Village (+2 actions)</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.requireVillage}
      onclick={() => {
        settingsState.requireVillage = !settingsState.requireVillage
        saveAll()
      }}
    >
      {settingsState.requireVillage ? "True" : "False"}
    </button>
  </div>
</div>
<div class="item">
  <span>Require Draw (+2 cards)</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.requireDraw}
      onclick={() => {
        settingsState.requireDraw = !settingsState.requireDraw
        saveAll()
      }}
    >
      {settingsState.requireDraw ? "True" : "False"}
    </button>
  </div>
</div>
<div class="item">
  <span>Disable Attacks</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.disableAttack}
      onclick={() => {
        settingsState.disableAttack = !settingsState.disableAttack
        saveAll()
      }}
    >
      {settingsState.disableAttack ? "True" : "False"}
    </button>
  </div>
</div>
<div class="item">
  <span>Require Attack Reaction</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.requireReaction}
      onclick={() => {
        settingsState.requireReaction = !settingsState.requireReaction
        saveAll()
      }}
    >
      {settingsState.requireReaction ? "True" : "False"}
    </button>
  </div>
</div>
<div class="item">
  <span>Require Trashing</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.requireTrashing}
      onclick={() => {
        settingsState.requireTrashing = !settingsState.requireTrashing
        saveAll()
      }}
    >
      {settingsState.requireTrashing ? "True" : "False"}
    </button>
  </div>
</div>

<!-- Events -->
<div class="item column">
  <div class="event-total">
    <span>Events</span>
    <div style="display: flex; flex-direction: row; align-items: center; gap: .35rem;">
      <input
      class="input"
      id="event-like-cards-amount"
      disabled={!settingsState.eventLikeCardsMaster.enabled}
      type="number"
      min="0"
      max="20"
      onchange={saveAll}
      bind:value={settingsState.eventLikeCardsMaster.amount}
      />
      <button
        class="btn btn-primary btn-settings"
        class:enabled={settingsState.eventLikeCardsMaster.enabled}
        onclick={() => {
          settingsState.eventLikeCardsMaster.enabled = !settingsState.eventLikeCardsMaster.enabled
          saveAll()
        }}
      >
        {settingsState.eventLikeCardsMaster.enabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  </div>
  <div class="event-box-outer">
    {#each Object.entries(settingsState.eventLikeCards) as [key, _]}
      <div class="event-box">
        <button
          class="btn btn-primary btn-small btn-events"
          class:enabled={settingsState.eventLikeCards[key].enabled}
          onclick={() => {
            settingsState.eventLikeCards[key].enabled = !settingsState.eventLikeCards[key].enabled
            saveAll()
          }}
        >
          {key.charAt(0).toUpperCase() + key.slice(1)}s
        </button>
        <span>Less</span>
        <input
          id={`weight-${key}`}
          disabled={!settingsState.eventLikeCards[key].enabled}
          type="range"
          min="0"
          max="100"
          onchange={saveAll}
          bind:value={settingsState.eventLikeCards[key].weight}
        />
        <span>More</span>
      </div>
    {/each}
  </div>
</div>

<h2>App Preferences</h2>

<div class="item">
  <div style="display: flex; flex-direction: column;">
    <div>Show/hide sets - Hidden sets are disabled</div>
    <div class="pill-group">
      {#each Object.entries(settingsState.sets) as [key, set]}
        <button
          class="btn btn-primary btn-name"
          class:enabled={!settingsState.sets[key].hidden}
          onclick={() => {
            settingsState.sets[key].hidden = !settingsState.sets[key].hidden
            saveAll()
          }}
        >
          {settingsState.sets[key].name}
        </button>
      {/each}
    </div>
  </div>
</div>

<div class="item">
  <span>Hide logged-in indicator</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.hideLoginIcon}
      onclick={() => {
        settingsState.hideLoginIcon = !settingsState.hideLoginIcon
      }}
    >
      {settingsState.hideLoginIcon ? "Hidden" : "Visible"}
    </button>
  </div>
</div>

<div class="item">
  <span>Hide theme indicator</span>
  <div>
    <button
      class="btn btn-primary btn-settings"
      class:enabled={settingsState.hideThemeIcon}
      onclick={() => {
        settingsState.hideThemeIcon = !settingsState.hideThemeIcon
      }}
    >
      {settingsState.hideThemeIcon ? "Hidden" : "Visible"}
    </button>
  </div>
</div>

<style>
  a {
    text-decoration: none;
    color: var(--text);
  }

  h2 {
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .event-box-outer {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    width: 100%;
    gap: 1rem;
    padding: 1rem 0;
    justify-content: space-between;
  }

  .event-total {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-grow: 1;
    align-self: stretch;
    min-height: 100%;
  }

  .header-container {
    position: relative;
    width: var(--card-width);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text);
    margin-top: 1rem;
  }

  .item {
    border: 1px solid #ccc;
    font-size: var(--font-size-lg);
    padding: 0.5rem;
    border-radius: 4px;
    width: var(--card-width);
    margin: 0.25rem 0;
    display: flex;
    row-gap: 0.75rem;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .pill-group {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.25rem;
  }

  .btn-settings {
    min-width: 100px;
    background-color: #ff4444;
  }

  .btn.enabled {
    background-color: #4caf50;
  }

  .btn-events {
    width: 100%;
    max-width: 120px;
    background-color: #ff4444;
    margin-bottom: 0.5rem;
  }

  .btn-small {
    min-width: 40px;
  }

  .btn-name {
    min-width: 12rem;
    background-color: #ff4444;
  }

  .btn-name.enabled {
    background-color: #4caf50;
  }

  .button-group {
    padding: 0.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .event-box {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .event-box input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    max-width: none;
    flex: 1 1 auto;
    margin: 0 5px;
    padding: 0;
    box-sizing: border-box;
    background: transparent;
    accent-color: #4f9ce6;
  }

  .event-box input[type="range"]::-webkit-slider-runnable-track {
    height: 6px;
    background: linear-gradient(90deg, #eaf4ff 0%, #eaf4ff var(--progress, 50%), #f2f6fb var(--progress, 50%), #f2f6fb 100%);
    border-radius: 3px;
  }

  .event-box input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    margin-top: -4px;
    background: #4f9ce6;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  }

  .event-box input[type="range"]::-moz-range-track {
    height: 6px;
    background: #eee;
    border-radius: 3px;
  }

  .event-box input[type="range"]::-moz-range-progress {
    background: #4f9ce6;
    height: 6px;
    border-radius: 3px;
  }

  .event-box input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    background: #4f9ce6;
    border-radius: 50%;
    border: 2px solid #fff;
  }

  .event-box input[type="range"][disabled] {
    opacity: 0.5;
  }

  .row {
    flex-direction: row;
  }

  .column {
    flex-direction: column;
  }

  .icon-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s ease;
    position: absolute;
    right: 0;
  }

  .icon-button:hover {
    background: var(--bg-lighter);
  }

  .icon-button.open {
    background: var(--bg-lighter);
  }

  .advanced-settings {
    padding: 0.5rem;
    margin-left: 0.5rem;
    background: var(--bg-lighter);
    color: var(--text);
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.25rem 0;
  }

  .setting-row label {
    color: var(--text);
  }

  .setting-row input {
    width: 60px;
    max-width: 30%;
  }

  .event-box input {
    padding: 0.5rem 0.75rem;
  }

  .item input {
    max-width: 20%;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"] {
    -webkit-appearance: none;
    appearance: textfield;
    -moz-appearance: textfield;
    margin: 0;
  }

  @media (max-width: 740px) {
    .btn-settings {
      min-width: 60px;
      padding: 5px 0;
    }

    .button-group {
      padding: 0.3rem;
    }

    .btn-name {
      min-width: 9rem;
      background-color: #ff4444;
    }

    .event-box-outer {
      gap: 1rem 0rem;
    }

    .event-box input {
      padding: 0.25rem 0.35rem;
    }
  }
</style>
