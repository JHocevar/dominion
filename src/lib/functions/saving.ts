import { settingsState } from "$lib/state/settings.svelte"
import { kingdomState } from "$lib/state/kingdom.svelte"
import { conflictState } from "$lib/state/conflicts.svelte"

const SETTINGS_KEY = "dominion.settings"
const KINGDOM_KEY = "dominion.kingdom"
const TIMESTAMP_KEY = "dominion.lastModified"

export async function saveAll() {
  const now = new Date().toISOString()

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsState))
    localStorage.setItem(KINGDOM_KEY, JSON.stringify(kingdomState))
    localStorage.setItem(TIMESTAMP_KEY, now)
  }

  try {
    const response = await fetch("/api/save-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        settings: settingsState,
        kingdom: kingdomState,
      }),
    })

    if (!response.ok) {
      console.error("Failed to save to database")
    }
  } catch (error) {
    console.error("Error saving to database:", error)
  }
}

export async function loadAll(): Promise<void> {
  let localTimestamp = null
  if (typeof localStorage !== 'undefined') {
    const timestampStr = localStorage.getItem(TIMESTAMP_KEY)
    if (timestampStr) {
      localTimestamp = new Date(timestampStr)
    }
  }

  try {
    const response = await fetch("/api/load-game")
    if (response.ok) {
      const data = await response.json()

      if (data.settings && data.kingdom) {
        const remoteTimestamp = data.updatedAt ? new Date(data.updatedAt) : null

        // Check for conflict
        if (localTimestamp && remoteTimestamp) {
          const timeDiff = Math.abs(remoteTimestamp.getTime() - localTimestamp.getTime())
          
          if (timeDiff > 5000) { // 5 seconds
            conflictState.showConflict = true
            conflictState.conflictData = {
              local: {
                settings: loadFromLocalStorage(SETTINGS_KEY),
                kingdom: loadFromLocalStorage(KINGDOM_KEY),
                timestamp: localTimestamp
              },
              remote: {
                settings: data.settings,
                kingdom: data.kingdom,
                timestamp: remoteTimestamp
              }
            }
            return
          }
        }

        // No conclift, or remote is newer
        if (!localTimestamp || (remoteTimestamp && remoteTimestamp > localTimestamp)) {
          loadStateByMerging(settingsState, data.settings)
          loadStateByMerging(kingdomState, data.kingdom)
          conflictState.showConflict = false
          return
        }
      }
    }
  } catch (error) {
    console.error("Error loading from database:", error)
  }

  loadKeyFromLocalStorage(SETTINGS_KEY, settingsState)
  loadKeyFromLocalStorage(KINGDOM_KEY, kingdomState)

  conflictState.showConflict = false
}

export async function resolveConflict(choice: 'local' | 'remote', conflictData: any) {
  if (choice === 'remote') {
    loadStateByMerging(settingsState, conflictData.remote.settings)
    loadStateByMerging(kingdomState, conflictData.remote.kingdom)
  } else {
    loadKeyFromLocalStorage(SETTINGS_KEY, settingsState)
    loadKeyFromLocalStorage(KINGDOM_KEY, kingdomState)
  }
  saveAll()
}

function loadFromLocalStorage(key: string): null | any {
  if (typeof localStorage === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Error while parsing data from localstorage')
    return null
  }
}

function loadKeyFromLocalStorage(key: string, ref: any) {
  const parsed = loadFromLocalStorage(key)
  if (parsed) {
    loadStateByMerging(ref, parsed)
  }
}

function loadStateByMerging(state: any, newState: any): void {
  if (state.version && state.version !== newState.version) {
    console.warn("Schema changed, it's data will be reset to pick up changes")
    return
  }

  Object.keys(newState).forEach((k) => {
    state[k] = newState[k]
  })
}
