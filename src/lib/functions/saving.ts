import { settingsState } from "$lib/state/settings.svelte"
import { kingdomState } from "$lib/state/kingdom.svelte"
import { statsState } from "$lib/state/stats.svelte"
import { conflictState } from "$lib/state/conflicts.svelte"
import { page } from "$app/state"

const SETTINGS_KEY = "dominion.settings"
const KINGDOM_KEY = "dominion.kingdom"
const STATS_KEY = "dominion.stats"
const TIMESTAMP_KEY = "dominion.lastModified"

export async function saveAll() {
  const now = new Date().toISOString()

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsState))
    localStorage.setItem(KINGDOM_KEY, JSON.stringify(kingdomState))
    localStorage.setItem(STATS_KEY, JSON.stringify(statsState))
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
        stats: statsState,
      }),
    })

    if (!response.ok) {
      console.error("Failed to save to database")
    }
  } catch (error) {
    console.error("Error saving to database:", error)
  }
}

export async function saveKingdomToDb() {
  try {
    const response = await fetch("/api/save-kingdom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kingdom: kingdomState }),
    })

    if (!response.ok) {
      console.error("Failed to save kingdom to database")
    }
    const data = await response.json()
    kingdomState.kingdomId = data.kingdomId
  } catch (error) {
    console.error("Error saving kingdom to database:", error)
  }
}

export async function loadAll(skipKingdom: boolean = false): Promise<void> {
  let localTimestamp = null
  if (typeof localStorage !== "undefined") {
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

          if (timeDiff > 5000) {
            // 5 seconds
            conflictState.showConflict = true
            conflictState.conflictData = {
              local: {
                settings: loadFromLocalStorage(SETTINGS_KEY),
                kingdom: loadFromLocalStorage(KINGDOM_KEY),
                stats: loadFromLocalStorage(STATS_KEY),
                timestamp: localTimestamp,
              },
              remote: {
                settings: data.settings,
                kingdom: data.kingdom,
                stats: data.stats,
                timestamp: remoteTimestamp,
              },
            }
            return
          }
        }

        // No conclift, or remote is newer
        if (!localTimestamp || (remoteTimestamp && remoteTimestamp > localTimestamp)) {
          loadStateByMerging(settingsState, data.settings)
          loadStateByMerging(statsState, data.stats)
          if (!skipKingdom) {
            loadStateByMerging(kingdomState, data.kingdom)
          }
          conflictState.showConflict = false
          return
        }
      }
    }
  } catch (error) {
    console.error("Error loading from database:", error)
  }

  loadKeyFromLocalStorage(SETTINGS_KEY, settingsState)
  if (!skipKingdom) loadKeyFromLocalStorage(KINGDOM_KEY, kingdomState)
  loadKeyFromLocalStorage(STATS_KEY, statsState)

  conflictState.showConflict = false
}

export async function resolveConflict(choice: "local" | "remote", conflictData: any, skipKingdom: boolean = false) {
  if (choice === "remote") {
    loadStateByMerging(settingsState, conflictData.remote.settings)
    if (!skipKingdom) loadStateByMerging(kingdomState, conflictData.remote.kingdom)
    loadStateByMerging(statsState, conflictData.remote.stats)
  } else {
    loadKeyFromLocalStorage(SETTINGS_KEY, settingsState)
    if (!skipKingdom) loadKeyFromLocalStorage(KINGDOM_KEY, kingdomState)
    loadKeyFromLocalStorage(STATS_KEY, statsState)
  }
  saveAll()
}

function loadFromLocalStorage(key: string): null | any {
  if (typeof localStorage === "undefined") {
    return null
  }

  const raw = localStorage.getItem(key)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (e) {
    console.warn("Error while parsing data from localstorage")
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

  function merge(target: any, source: any) {
    for (const key in source) {
      switch (true) {
        case target[key] instanceof Date:
          target[key] = new Date(source[key])
          break

        // TODO: Generic version of this
        case key === "playedKingdoms":
          target[key] = []
          source[key].forEach((k: any) => {
            const x = {
              date: new Date(k.date),
              name: k.name,
              kingdom: k.kingdom,
              favorite: k.favorite,
            }
            target[key].push(x)
          })
          break

        case target[key] instanceof Object:
          merge(target[key], source[key])
          break

        default:
          target[key] = source[key]
      }
    }
  }

  merge(state, newState)
}
