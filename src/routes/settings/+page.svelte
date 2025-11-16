<script lang="ts">
  import { settingsState } from "$lib/state/settings.svelte"
  import { saveAll } from "$lib/functions/saving"
  import { MediaQuery } from "svelte/reactivity"

  let showAdvanced = false

  function toggleAllAdvanced() {
    showAdvanced = !showAdvanced
  }

  let bigEnough = new MediaQuery("min-width: 375px")
</script>

<h1>Settings</h1>

<div class="btn btn-primary" style="padding: .75rem;">
  <a href="/generator">Looks good - Let's generate!</a>
</div>

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
                settingsState.sets[key].secondEditionEnabled =
                  !settingsState.sets[key].secondEditionEnabled
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

<div>
  <span style="color: red;">{settingsState.bannedCards.length}</span>
  <span>banned cards. Update in the</span>
  <button class="btn btn-primary"><a href="/database">Database</a></button>
</div>

<div class="item">
  <span> Platinum / Colony % per card </span>
  <input
    class="input"
    onchange={saveAll}
    bind:value={settingsState.platinumChance}
  />
</div>
<div class="item">
  <span> Platinum / Colony % with 0 cards </span>
  <input
    class="input"
    onchange={saveAll}
    bind:value={settingsState.platinumChanceNoCards}
  />
</div>

<div class="item">
  <span> Shelters % per card </span>
  <input
    class="input"
    onchange={saveAll}
    bind:value={settingsState.shelterChance}
  />
</div>
<div class="item">
  <span> Shelters % with 0 cards </span>
  <input
    class="input"
    onchange={saveAll}
    bind:value={settingsState.shelterChanceNoCards}
  />
</div>

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

  .btn-settings.enabled {
    background-color: #4caf50;
  }

  .btn-small {
    min-width: 40px;
  }

  .btn-name {
    min-width: 9rem;
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

  @media (max-width: 740px) {
    .btn-settings {
      min-width: 60px;
      padding: 5px 0;
    }

    .button-group {
      padding: 0.3rem;
    }
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
    margin: 0;
  }
</style>
