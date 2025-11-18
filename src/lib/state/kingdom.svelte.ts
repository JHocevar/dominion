import type { Card } from '$lib/functions/cards'

export type Kingdom = {
  cards: Card[]
  extraCards: Card[]
}

export const kingdomState = $state<Kingdom>({
  cards: [],
  extraCards: [],
})