<script lang="ts">
  import { settingsState, saveSettings } from "$lib/state/settings.svelte"
  let showSets = true
  let showAdvanced = false

  function toggleAllAdvanced() {
    showAdvanced = !showAdvanced
  }
</script>

<h1>Settings</h1>

<div class="header-container">
  <button
    class="section-header"
    onclick={() => (showSets = !showSets)}
    onkeydown={(e) => e.key === "Enter" && (showSets = !showSets)}
  >
    <h2>Card Sets</h2>
    <span class="dropdown-toggle" class:open={showSets}>▼</span>
  </button>
  <button
    class="icon-button"
    onclick={toggleAllAdvanced}
    class:open={showAdvanced}
    aria-label="Toggle all advanced settings"
  >
    ⚙️
  </button>
</div>

{#if showSets}
  {#each Object.entries(settingsState.sets) as [key, set]}
    <div class="item">
      <div class="item-header">
        <span>{set.name}</span>
        <div class={["button-group", showAdvanced ? "column" : "row"]}>
          {#if set.secondEdition}
            <button
              class="btn btn-primary btn-settings btn-small"
              class:enabled={settingsState.sets[key].secondEditionEnabled}
              disabled={settingsState.sets[key].enabled === false}
              onclick={() => {
                settingsState.sets[key].secondEditionEnabled =
                  !settingsState.sets[key].secondEditionEnabled
                saveSettings()
              }}
            >
              {settingsState.sets[key].secondEditionEnabled
                ? "2nd"
                : "1st"}
            </button>
          {/if}
          <button
            class="btn btn-primary btn-settings"
            class:enabled={settingsState.sets[key].enabled}
            onclick={() => {
              settingsState.sets[key].enabled = !settingsState.sets[key].enabled
              saveSettings()
            }}
            >{settingsState.sets[key].enabled ? "Enabled" : "Disabled"}</button
          >
        </div>
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
              onchange={saveSettings}
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
              onchange={saveSettings}
              bind:value={settingsState.sets[key].minCards}
            />
          </div>
        </div>
      {/if}
    </div>
  {/each}
{/if}

<div class="item not-implemented">
  <span> Platinum / Colony % per card </span>
  <input
    class="input not-implemented"
    disabled
    onchange={saveSettings}
    bind:value={settingsState.platinumChance}
  />
</div>
<div class="item not-implemented">
  <span> Platinum / Colony % with 0 cards </span>
  <input
    class="input not-implemented"
    disabled
    onchange={saveSettings}
    bind:value={settingsState.platinumChanceNoCards}
  />
</div>

<div class="item not-implemented">
  <span> Shelters % per card </span>
  <input
    class="input not-implemented"
    disabled
    onchange={saveSettings}
    bind:value={settingsState.shelterChance}
  />
</div>
<div class="item not-implemented">
  <span> Shelters % with 0 cards </span>
  <input
    class="input not-implemented"
    disabled
    onchange={saveSettings}
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
        saveSettings()
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
        saveSettings()
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
        saveSettings()
      }}
    >
      {settingsState.disableAttack ? "True" : "False"}
    </button>
  </div>
</div>
<div class="item not-implemented">
  <span>Require Reaction</span>
  <div>
    <button
      class="btn btn-primary btn-settings not-implemented"
      class:enabled={settingsState.requireReaction}
      onclick={() => {
        settingsState.requireReaction = !settingsState.requireReaction
        saveSettings()
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
        saveSettings()
      }}
    >
      {settingsState.requireTrashing ? "True" : "False"}
    </button>
  </div>
</div>

<style>
  .header-container {
    width: var(--card-width);
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    color: var(--text);
  }

  .section-header {
    flex-grow: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    font-size: inherit;
    text-align: left;
  }

  .section-header:hover {
    background: var(--bg-lighter);
    border-radius: 8px;
  }

  .section-header h2 {
    margin: 0;
    color: var(--text);
  }

  .dropdown-toggle {
    transition: transform 0.3s ease;
    display: inline-block;
    font-size: 1.2rem;
    color: var(--text);
  }

  .dropdown-toggle.open {
    transform: rotate(180deg);
  }

  /* input styles are provided globally in +layout.css as .input */

  .item {
    border: 1px solid #ccc;
    font-size: var(--font-size-base);
    padding: 0.5rem;
    border-radius: 4px;
    width: var(--card-width);
    margin: 0.25rem 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .btn-settings {
    min-width: 60px;
    background-color: #ff4444;
  }

  .btn-settings.enabled {
    background-color: #4caf50;
  }

  .btn-small {
    width: 10px;
    min-width: 40px;
  }

  .button-group {
    padding: 0.75rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
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
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .icon-button:hover {
    background: var(--bg-lighter);
  }

  .icon-button.open {
    background: var(--bg-lighter);
  }

  .advanced-settings {
    padding: 0.5rem;
    margin-left: .5rem;
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

  .not-implemented {
    color: var(--muted);
    opacity: 0.5;
  }

  .not-implemented:hover {
    cursor: default !important;
    transform: none !important;
    opacity: 0.5 !important;
  }
</style>
