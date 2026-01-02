import { parse as jsoncParse } from "jsonc-parser"
import { settingsState } from "$lib/state/settings.svelte"
import { kingdomState } from "$lib/state/kingdom.svelte"
import {
  blankCard,
  loadAllCards,
  loadAllSupplyCards,
  loadAllEventLikeCards,
  loadPlatinumColonyCards,
  omenCards,
  type Card,
} from "$lib/functions/cards"
import drawCardsJson from "$lib/data/draw-cards.jsonc?raw"
import { saveAll } from "$lib/functions/saving"

const drawCards = jsoncParse(drawCardsJson)

export function generateKingdon() {
  kingdomState.cards = []
  kingdomState.extraCards = []
  kingdomState.eventLikeCards = []
  kingdomState.extraMappings = {}

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

  // Event-like cards. Liason/Ally -> Omen/Prophecy -> Other -> Check Trait mappings
  if (settingsState.eventLikeCardsMaster.enabled) {
    assignAllies()
    assignProphecies()
    const availableEventLikeCards = getAvailableEventLikeCards()

    const target = settingsState.eventLikeCardsMaster.amount

    // Use top-level weighted picker

    // Build list of enabled category keys
    const enabledKeys = () =>
      Object.keys(settingsState.eventLikeCards).filter((k) => {
        const cfg = settingsState.eventLikeCards[k]
        return !!cfg && cfg.enabled !== false
      })

    while (kingdomState.eventLikeCards.length < target && availableEventLikeCards.length > 0) {
      const keys = enabledKeys()
      if (keys.length === 0) break

      const chosenKey = pickWeightedCategory(keys)
      if (!chosenKey) break

      // pick a random available card that matches the chosen category
      const pool = availableEventLikeCards.filter((card) => card.Types.includes(chosenKey))
      let chosenCard = null
      if (pool.length > 0) {
        chosenCard = getRandomCard(pool)
      } else {
        // fallback: pick any available event-like card
        chosenCard = getRandomCard(availableEventLikeCards)
      }

      if (!chosenCard) break
      availableEventLikeCards.splice(availableEventLikeCards.indexOf(chosenCard), 1)
      kingdomState.eventLikeCards.push(chosenCard)
    }
  }

  // Check for trait matching
  assignTraitMappings()

  kingdomState.cards.sort((cardA, cardB) => cardA.Name.localeCompare(cardB.Name))

  saveAll()
  return "Generated new kingdom"
}

function assignAllies() {
  if (kingdomState.cards.some((card) => card.Types.includes("Liaison"))) {
    const allies = getAvailableAllies()
    if (allies.length > 0) {
      const randomAlly = getRandomCard(allies)
      kingdomState.eventLikeCards.push(randomAlly)
    }
  }
}

function assignTraitMappings() {
  // First clear all trait mappings just in case. This could be redundant, but better safe
  for (const [key, value] of Object.entries(kingdomState.extraMappings)) {
    if (value.includes("trait-")) {
      delete kingdomState.extraMappings[key]
    }
  }

  // Loop through all traits and assign a random kingdom card to each (must be different)
  kingdomState.eventLikeCards
    .filter((card) => card.Types.includes("Trait"))
    .forEach((traitCard) => {
      const chosenCard = getRandomCard(kingdomState.cards.filter((c) => !kingdomState.extraMappings[c.Name]))
      kingdomState.extraMappings[chosenCard.Name] = `trait-${traitCard.Name}`
    })
}

function assignProphecies() {
  if (kingdomState.cards.some((card) => card.Types.includes("Omen"))) {
    const prophecies = getAvailableProphecies()
    if (prophecies.length > 0) {
      const randomProphecy = getRandomCard(prophecies)
      kingdomState.eventLikeCards.push(randomProphecy)
    }
  }
}

function getRandomCard(cards: any[]): any {
  const randomIndex = Math.floor(Math.random() * cards.length)
  return cards[randomIndex]
}

// Pick a category key from `keys` using the configured weights in `settingsState.eventLikeCards`.
// Returns the selected key, or null if no keys provided.
function pickWeightedCategory(keys: string[]): string | null {
  const items = keys
    .map((k) => ({ k, w: Number(settingsState.eventLikeCards[k]?.weight ?? 0) }))
    .filter((it) => it.w >= 0)
  let total = items.reduce((s, it) => s + it.w, 0)
  if (items.length === 0) return null
  if (total <= 0) {
    items.forEach((it) => (it.w = 1))
    total = items.length
  }
  let r = Math.random() * total
  for (const it of items) {
    if (r < it.w) return it.k
    r -= it.w
  }
  return items[items.length - 1].k
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

  // Remove Omen cards if Prophecy is disabled
  if (
    settingsState.eventLikeCardsMaster.amount === 0 ||
    settingsState.eventLikeCards["Prophecy"]?.enabled === false ||
    settingsState.eventLikeCards["Prophecy"]?.weight === 0 ||
    enabledSets.every((set) => set !== "Rising Sun")
  ) {
    allCards = allCards.filter((card) => !card.Types.includes("Omen"))
  }

  // Remove Liason cards if Ally is disabled
  if (
    settingsState.eventLikeCardsMaster.amount === 0 ||
    settingsState.eventLikeCards["Ally"]?.enabled === false ||
    settingsState.eventLikeCards["Ally"]?.weight === 0 ||
    enabledSets.every((set) => set !== "Allies")
  ) {
    allCards = allCards.filter((card) => !card.Types.includes("Liason"))
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
  return allCards.filter(
    (card) =>
      card.Types.includes("Ally") &&
      !settingsState.bannedCards.includes(card.Name) &&
      kingdomState.extraCards.every((c) => c.Name !== card.Name)
  )
}

function getAvailableProphecies(): Card[] {
  const allCards = loadAllCards()
  return allCards.filter(
    (card) =>
      card.Types.includes("Prophecy") &&
      !settingsState.bannedCards.includes(card.Name) &&
      kingdomState.extraCards.every((c) => c.Name !== card.Name)
  )
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

  // First check if card is ally or prophecy and handle those specially
  if (oldCard.Types.includes("Ally")) {
    const availableAllies = getAvailableAllies().filter((c) => c.Name !== oldCard.Name)
    if (availableAllies.length > 0) {
      const newAlly = getRandomCard(availableAllies)
      kingdomState.eventLikeCards[index] = newAlly
      saveAll()
    }
    return
  } else if (oldCard.Types.includes("Prophecy")) {
    const availableProphecies = getAvailableProphecies().filter((c) => c.Name !== oldCard.Name)
    if (availableProphecies.length > 0) {
      const newProphecy = getRandomCard(availableProphecies)
      kingdomState.eventLikeCards[index] = newProphecy
      saveAll()
    }
    return
  }

  // Build candidate pool excluding the old card
  let candidates = getAvailableEventLikeCards().filter((c) => c.Name !== oldCard.Name)
  if (candidates.length === 0) return

  // Use top-level weighted picker

  const enabledKeys = Object.keys(settingsState.eventLikeCards).filter((k) => {
    const cfg = settingsState.eventLikeCards[k]
    return !!cfg && cfg.enabled !== false
  })

  let chosen: Card | null = null
  const chosenKey = pickWeightedCategory(enabledKeys)
  if (chosenKey) {
    const pool = candidates.filter((c) => c.Types.includes(chosenKey))
    if (pool.length > 0) chosen = getRandomCard(pool)
  }

  if (!chosen) chosen = getRandomCard(candidates)

  if (chosen) {
    kingdomState.eventLikeCards[index] = chosen
    assignTraitMappings()
    saveAll()
  }
}
