import type { Card } from '$lib/functions/cards'

export const kingdomState = $state<{ cards: Card[], extraCards: Card[] }>({
  cards: [],
  extraCards: [],
})
