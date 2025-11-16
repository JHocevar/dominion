<script lang="ts">
  import { resolveConflict } from "$lib/functions/saving"

  export let conflictData: any
  export let onResolve: () => void

  async function handleChoice(choice: "local" | "remote") {
    await resolveConflict(choice, conflictData)
    onResolve()
  }

  function formatDate(date: Date) {
    return date.toLocaleString()
  }
</script>

<div class="modal-overlay">
  <div class="modal">
    <h2>Data Conflict Detected</h2>
    <p>
      We found different save data on this device and in the cloud. Which would
      you like to keep?
    </p>

    <div class="options">
      <div class="option">
        <h3>📱 Local Save</h3>
        <p class="timestamp">
          Last saved: {formatDate(conflictData.local.timestamp)}
        </p>
        <button onclick={() => handleChoice("local")}> Use Local Save </button>
      </div>

      <div class="option">
        <h3>☁️ Cloud Save</h3>
        <p class="timestamp">
          Last saved: {formatDate(conflictData.remote.timestamp)}
        </p>
        <button onclick={() => handleChoice("remote")}>
          Use Cloud Save
        </button>
      </div>

      <p class="warning">⚠️ The other save will be overwritten</p>
    </div>
  </div>
</div>



<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
  }
  
  h2 {
    margin-top: 0;
  }
  
  .options {
    display: flex;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  
  .option {
    flex: 1;
    border: 2px solid #ddd;
    padding: 1rem;
    border-radius: 4px;
    text-align: center;
  }
  
  .option h3 {
    margin-top: 0;
  }
  
  .timestamp {
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  button:hover {
    background: #0056b3;
  }
  
  .warning {
    text-align: center;
    color: #856404;
    background: #fff3cd;
    padding: 0.5rem;
    border-radius: 4px;
    margin-top: 1rem;
  }
</style>