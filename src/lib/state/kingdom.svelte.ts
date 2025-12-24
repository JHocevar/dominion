import type { Card } from '$lib/functions/cards'

declare global {
  interface Window {
    KingdomState: Kingdom
  }
}

export type Kingdom = {
  cards: Card[]
  extraCards: Card[],
  eventLikeCards: Card[],
  extraMappings: Record<Card["Name"], string>,
  kingdomId: string,
}

export type KingdomMinimized = {
  cards: string[]
  extraCards: string[]
  eventLikeCards: string[]
  extraMappings: Record<Card["Name"], string>
}

export const kingdomState = $state<Kingdom>({
  cards: [],
  extraCards: [],
  eventLikeCards: [],
  extraMappings: {},
  kingdomId: '',
})

export function getKingdomMinimized(kingdom: Kingdom): KingdomMinimized {
  return {
    cards: kingdom.cards.map(card => card.Name),
    extraCards: kingdom.extraCards.map(card => card.Name),
    eventLikeCards: kingdom.eventLikeCards.map(card => card.Name),
    extraMappings: kingdom.extraMappings
  }
}

export function imoprtKingdom(kingdomBase64: string): string {
  const json = decodeURIComponent(kingdomBase64)
  if (json === null) throw new Error('Failed to decompress kingdom string')
  return json
}

// backwards-compatible alias with a clearer name
export const importKingdom = imoprtKingdom

// window.KingdomState = kingdomState