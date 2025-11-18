import type { Kingdom } from '$lib/state/kingdom.svelte'

type StatsState = {
  playedKingdoms: Array<{
    date: Date,
    name: string,
    kingdom: Kingdom,
    favorite: boolean
  }>
  playedCards: Record<string, number>
}

export const statsState = $state<StatsState>({
  playedKingdoms: [],
  playedCards: {}
})