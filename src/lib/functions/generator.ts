import { parse as jsoncParse } from "jsonc-parser"
import { settingsState } from "$lib/state/settings.svelte"
import { kingdomState } from "$lib/state/kingdom.svelte"
import {
  blankCard,
  loadAllSupplyCards,
  loadPlatinumColonyCards,
  type Card,
} from "$lib/functions/cards"
import drawCardsJson from "$lib/data/draw-cards.jsonc?raw"

const drawCards = jsoncParse(drawCardsJson)

export function generateKingdon() {
  kingdomState.cards = []
  kingdomState.extraCards = []

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

  kingdomState.cards.sort((cardA, cardB) =>
    cardA.Name.localeCompare(cardB.Name)
  )
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
    card.Text.toLocaleLowerCase().includes(
      "when another player plays an attack"
    )
  )
  if (attackReactions.length > 0) {
    return getRandomCard(attackReactions)
  }
  return null
}

export function getAvailableCards(): Card[] {
  const enabledSets = Object.keys(settingsState.sets)
    .filter(
      (set) =>
        settingsState.sets[set].enabled && !settingsState.sets[set].hidden
    )
    .flatMap((set) => {
      return settingsState.sets[set].secondEdition
        ? settingsState.sets[set].secondEditionEnabled
          ? [
              settingsState.sets[set].name,
              settingsState.sets[set].name + ", 2E",
            ]
          : [
              settingsState.sets[set].name,
              settingsState.sets[set].name + ", 1E",
            ]
        : [settingsState.sets[set].name]
    })

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

function usePlatinumColony(kingdomCards: Card[]): boolean {
  const prosperityCards = kingdomCards.filter((card) =>
    card.Set.includes("Prosperity")
  )
  const prosperityCount = prosperityCards.length

  const percentage =
    prosperityCount > 0
      ? prosperityCount * settingsState.platinumChance
      : settingsState.platinumChanceNoCards

  return Math.random() < percentage
}

function useShelters(kingdomCards: Card[]): boolean {
  const darkAgesCards = kingdomCards.filter((card) =>
    card.Set.includes("Dark Ages")
  )
  const darkAgesCount = darkAgesCards.length

  const percentage =
    darkAgesCount > 0
      ? darkAgesCount * settingsState.shelterChance
      : settingsState.shelterChanceNoCards

  return Math.random() < percentage
}

export function rerollOneCard(card: Card): void {
  const availableCards = getAvailableCards().filter((c) => c.Name !== card.Name)
  const randomCard = getRandomCard(availableCards)
  const index = kingdomState.cards.findIndex((c) => c.Name === card.Name)
  if (index !== -1) {
    kingdomState.cards[index] = randomCard
  }
}
