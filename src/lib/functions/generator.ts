import { parse as jsoncParse } from "jsonc-parser"
import { settingsState } from "$lib/state/settings.svelte"
import { kingdomState } from "$lib/state/kingdom.svelte"
import {
  blankCard,
  loadAllCards,
  loadAllSupplyCards,
  loadAllEventLikeCards,
  loadPlatinumColonyCards,
  type Card,
} from "$lib/functions/cards"
import drawCardsJson from "$lib/data/draw-cards.jsonc?raw"
import { saveAll } from "$lib/functions/saving"

const drawCards = jsoncParse(drawCardsJson)

export function generateKingdon() {
  kingdomState.cards = []
  kingdomState.extraCards = []
  kingdomState.eventLikeCards = []

  const availableCards = getAvailableCards()

  if (availableCards.length === 0) {
    kingdomState.cards = []
    return "No sets enabled"
  }

  // Apply guaranteed cards
  if (settingsState.requireVillage) {
    const village = getVillage(availableCards)
    if (village) {
      console.log("adding village: ", village)
      kingdomState.cards.push(village)
      availableCards.splice(availableCards.indexOf(village), 1)
    }
  }
  if (settingsState.requireDraw) {
    const drawCard = getDrawCard(availableCards)
    if (drawCard) {
      console.log("adding draw: ", drawCard)
      kingdomState.cards.push(drawCard)
      availableCards.splice(availableCards.indexOf(drawCard), 1)
    }
  }
  if (!settingsState.disableAttack && settingsState.requireReaction) {
    const reaction = getAttackReaction(availableCards)
    if (reaction) {
      console.log("adding reaction: ", reaction)
      kingdomState.cards.push(reaction)
      availableCards.splice(availableCards.indexOf(reaction), 1)
    }
  }
  if (settingsState.requireTrashing) {
    const trashing = getTrashing(availableCards)
    if (trashing) {
      console.log("adding trashing: ", trashing)
      kingdomState.cards.push(trashing)
      availableCards.splice(availableCards.indexOf(trashing), 1)
    }
  }

  while (kingdomState.cards.length < 10) {
    const randomCard = getRandomCard(availableCards)
    availableCards.splice(availableCards.indexOf(randomCard), 1)
    kingdomState.cards.push(randomCard)
  }

  // Check Platinum / Colony
  if (usePlatinumColony(kingdomState.cards)) {
    kingdomState.extraCards.push(...loadPlatinumColonyCards())
  }

  // Check Shelters
  if (useShelters(kingdomState.cards)) {
    kingdomState.extraCards.push({
      ...blankCard,
      Name: "Shelters",
      Types: "Action - Reaction - Duration - Victory",
    })
  }

  // Event-like cards
  if (settingsState.eventLikeCardsMaster.enabled) {
    const availableEventLikeCards = getAvailableEventLikeCards()

    const target = settingsState.eventLikeCardsMaster.amount
    while (kingdomState.eventLikeCards.length < target && availableEventLikeCards.length > 0) {
      for (const key of Object.keys(settingsState.eventLikeCards)) {
        if (kingdomState.eventLikeCards.length >= target) break
        const cfg = settingsState.eventLikeCards[key]
        if (!cfg || cfg.enabled === false) continue

        // Ensure we satisfy the configured minimum for this key fully
        let selectedCardsWithKey = kingdomState.eventLikeCards.filter((card) => card.Types.includes(key)).length
        while ((cfg.min ?? 0) > selectedCardsWithKey && kingdomState.eventLikeCards.length < target) {
          const availableWithKey = availableEventLikeCards.filter((card) => card.Types.includes(key))
          if (availableWithKey.length === 0) break
          const randomCard = getRandomCard(availableWithKey)
          availableEventLikeCards.splice(availableEventLikeCards.indexOf(randomCard), 1)
          kingdomState.eventLikeCards.push(randomCard)
          selectedCardsWithKey++
        }
      }

      if (kingdomState.eventLikeCards.length >= target) break

      const candidatePool = availableEventLikeCards.filter((card) => {
        for (const key of Object.keys(settingsState.eventLikeCards)) {
          const cfg = settingsState.eventLikeCards[key]
          if (!cfg || cfg.enabled === false) continue
          if (card.Types.includes(key) && typeof cfg.max === "number") {
            const selected = kingdomState.eventLikeCards.filter((c) => c.Types.includes(key)).length
            if (selected >= cfg.max) return false
          }
        }
        return true
      })

      if (candidatePool.length === 0) break

      const randomCard = getRandomCard(candidatePool)
      availableEventLikeCards.splice(availableEventLikeCards.indexOf(randomCard), 1)
      kingdomState.eventLikeCards.push(randomCard)
    }
  }

  // Check for trait matching
  kingdomState.eventLikeCards
    .filter((card) => card.Types.includes("Trait"))
    .forEach((traitCard) => {
      const chosenCard = getRandomCard(kingdomState.cards.filter((c) => !kingdomState.extraMappings[c.Name]))
      kingdomState.extraMappings[chosenCard.Name] = `trait-${traitCard.Name}`
    })

  // Check for Liason
  if (kingdomState.cards.some((card) => card.Types.includes("Liaison"))) {
    const allies = getAvailableAllies()
    if (allies.length > 0) {
      const randomAlly = getRandomCard(allies)
      kingdomState.eventLikeCards.push(randomAlly)
    }
  }

  kingdomState.cards.sort((cardA, cardB) => cardA.Name.localeCompare(cardB.Name))

  saveAll()
  return "Generated new kingdom"
}

function getRandomCard(cards: any[]): any {
  const randomIndex = Math.floor(Math.random() * cards.length)
  return cards[randomIndex]
}

function getVillage(cards: Card[]): Card | null {
  const villages = cards.filter((card) => parseInt(card.Actions) >= 2)
  if (villages.length > 0) {
    return getRandomCard(villages)
  }
  return null
}

function getDrawCard(cards: Card[]): Card | null {
  const noSupport = drawCards.noSupport
  const villageSupport = drawCards.villageSupport
  const combined = [...noSupport, ...villageSupport]

  const drawers = cards.filter((card) => combined.includes(card.Name))
  if (drawers.length > 0) {
    return getRandomCard(drawers)
  }
  return null
}

function getTrashing(cards: Card[]): Card | null {
  const trashers = cards.filter((card) => parseInt(card.Trash) >= 1)
  if (trashers.length > 0) {
    return getRandomCard(trashers)
  }
  return null
}

function getAttackReaction(cards: Card[]): Card | null {
  const attackReactions = cards.filter((card) =>
    card.Text.toLocaleLowerCase().includes("when another player plays an attack")
  )
  if (attackReactions.length > 0) {
    return getRandomCard(attackReactions)
  }
  return null
}

function getEnabledSets(): string[] {
  return Object.keys(settingsState.sets)
    .filter((set) => settingsState.sets[set].enabled && !settingsState.sets[set].hidden)
    .flatMap((set) => {
      return settingsState.sets[set].secondEdition
        ? settingsState.sets[set].secondEditionEnabled
          ? [settingsState.sets[set].name, settingsState.sets[set].name + ", 2E"]
          : [settingsState.sets[set].name, settingsState.sets[set].name + ", 1E"]
        : [settingsState.sets[set].name]
    })
}

export function getAvailableCards(): Card[] {
  const enabledSets = getEnabledSets()

  if (enabledSets.length === 0) {
    kingdomState.cards = []
    return []
  }

  let allCards = loadAllSupplyCards()
  if (settingsState.disableAttack) {
    allCards = allCards.filter((card) => !card.Types.includes("Attack"))
  }

  return allCards.filter(
    (card) =>
      enabledSets.includes(card.Set) &&
      !settingsState.bannedCards.includes(card.Name) &&
      !kingdomState.cards.some((c) => c.Name === card.Name)
  )
}

export function getAvailableEventLikeCards(): Card[] {
  const enabledSets = getEnabledSets()

  if (enabledSets.length === 0) {
    kingdomState.cards = []
    return []
  }

  let allEventLikeCards = loadAllEventLikeCards()
  return allEventLikeCards.filter(
    (card) =>
      enabledSets.includes(card.Set) &&
      !settingsState.bannedCards.includes(card.Name) &&
      !kingdomState.eventLikeCards.some((c) => c.Name === card.Name)
  )
}

function getAvailableAllies(): Card[] {
  const allCards = loadAllCards()
  return allCards
    .filter((card) => card.Types.includes("Ally"))
    .filter((card) => kingdomState.extraCards.every((c) => c.Name !== card.Name))
}

function usePlatinumColony(kingdomCards: Card[]): boolean {
  const prosperityCards = kingdomCards.filter((card) => card.Set.includes("Prosperity"))
  const prosperityCount = prosperityCards.length

  const percentage =
    prosperityCount > 0 ? prosperityCount * settingsState.platinumChance : settingsState.platinumChanceNoCards

  return Math.random() < percentage
}

function useShelters(kingdomCards: Card[]): boolean {
  const darkAgesCards = kingdomCards.filter((card) => card.Set.includes("Dark Ages"))
  const darkAgesCount = darkAgesCards.length

  const percentage =
    darkAgesCount > 0 ? darkAgesCount * settingsState.shelterChance : settingsState.shelterChanceNoCards

  return Math.random() < percentage
}

export function rerollOneCard(card: Card): void {
  const availableCards = getAvailableCards().filter((c) => c.Name !== card.Name)
  const randomCard = getRandomCard(availableCards)
  const index = kingdomState.cards.findIndex((c) => c.Name === card.Name)
  if (index !== -1) {
    kingdomState.cards[index] = randomCard
    saveAll()
  }
}

export function rerollOneEventLikeCard(card: Card): void {
  const index = kingdomState.eventLikeCards.findIndex((c) => c.Name === card.Name)
  if (index === -1) return

  // Remove any mappings associated with the old card
  const oldCard = kingdomState.eventLikeCards[index]
  for (const [key, value] of Object.entries(kingdomState.extraMappings)) {
    if (value === `trait-${oldCard.Name}`) {
      delete kingdomState.extraMappings[key]
    }
  }

  // Build candidate pool excluding the old card
  let candidates = getAvailableEventLikeCards().filter((c) => c.Name !== oldCard.Name)

  // Compute counts after removing the old card (simulate removal)
  const simulatedCounts: Record<string, number> = {}
  for (const kv of Object.keys(settingsState.eventLikeCards)) simulatedCounts[kv] = 0
  kingdomState.eventLikeCards.forEach((c, i) => {
    if (i === index) return // skip the card being replaced
    for (const key of Object.keys(settingsState.eventLikeCards)) {
      if (c.Types.includes(key)) simulatedCounts[key] = (simulatedCounts[key] ?? 0) + 1
    }
  })

  // Helper to check if adding a candidate would violate any max constraints
  const violatesMax = (candidate: Card) => {
    for (const key of Object.keys(settingsState.eventLikeCards)) {
      const cfg = settingsState.eventLikeCards[key]
      if (!cfg || cfg.enabled === false) continue
      if (candidate.Types.includes(key) && typeof cfg.max === "number") {
        const wouldBe = (simulatedCounts[key] ?? 0) + 1
        if (wouldBe > cfg.max) return true
      }
    }
    return false
  }

  // First, prioritize candidates that help satisfy any mins that would otherwise be violated
  const needyKeys = Object.keys(settingsState.eventLikeCards).filter((k) => {
    const cfg = settingsState.eventLikeCards[k]
    if (!cfg || cfg.enabled === false) return false
    const min = cfg.min ?? 0
    return (simulatedCounts[k] ?? 0) < min
  })

  let chosen: Card | null = null
  if (needyKeys.length > 0) {
    const preferred = candidates.filter((c) => needyKeys.some((k) => c.Types.includes(k)) && !violatesMax(c))
    if (preferred.length > 0) chosen = getRandomCard(preferred)
  }

  // If no preferred candidate, pick any that doesn't violate max
  if (!chosen) {
    const ok = candidates.filter((c) => !violatesMax(c))
    if (ok.length > 0) chosen = getRandomCard(ok)
  }

  // As a last resort, pick any candidate (may violate maxs)
  if (!chosen && candidates.length > 0) chosen = getRandomCard(candidates)

  if (chosen) {
    kingdomState.eventLikeCards[index] = chosen
    saveAll()
  }
}
