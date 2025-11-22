import type { Card } from '$lib/functions/cards'

export type Kingdom = {
  cards: Card[]
  extraCards: Card[],
  eventLikeCards: Card[],
  extraMappings: Record<Card["Name"], string>
}

export const kingdomState = $state<Kingdom>({
  cards: [],
  extraCards: [],
  eventLikeCards: [],
  extraMappings: {}
})