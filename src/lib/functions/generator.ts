import { settingsState } from "$lib/state/settings.svelte"
import { kingdomState } from "$lib/state/kingdom.svelte"
import { loadAllSupplyCards, type Card } from "$lib/functions/cards"

export function generateKingdon() {
  kingdomState.cards = []
  const availableCards = getAvailableCards()

  if (availableCards.length === 0) {
    kingdomState.cards = []
    return "No sets enabled"
  }

  // Apply guaranteed cards
  if (settingsState.requireVillage) {
    const village = getVillage(availableCards)
    if (village) {
      kingdomState.cards.push(village)
      availableCards.splice(availableCards.indexOf(village), 1)
    }
  }
  if (settingsState.requireVillage) {
    const drawCard = getDrawCard(availableCards)
    if (drawCard) {
      kingdomState.cards.push(drawCard)
      availableCards.splice(availableCards.indexOf(drawCard), 1)
    }
  }
  if (!settingsState.disableAttack && settingsState.requireReaction) {
    const reaction = getAttackReaction(availableCards)
    if (reaction) {
      kingdomState.cards.push(reaction)
      availableCards.splice(availableCards.indexOf(reaction), 1)
    }
  }

  while (kingdomState.cards.length < 10) {
    const randomCard = getRandomCard(availableCards)
    availableCards.splice(availableCards.indexOf(randomCard), 1)
    kingdomState.cards.push(randomCard)
  }

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

// TODO: implement
function getDrawCard(cards: Card[]): Card | null {
  return null
}

// TODO: implement
function getAttackReaction(cards: Card[]): Card | null {
  return null
}

function getAvailableCards(): Card[] {
  const enabledSets = Object.keys(settingsState.sets)
    .filter((set) => settingsState.sets[set].enabled)
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

export function rerollOneCard(card: Card): void {
  const availableCards = getAvailableCards().filter((c) => c.Name !== card.Name)
  const randomCard = getRandomCard(availableCards)
  const index = kingdomState.cards.findIndex((c) => c.Name === card.Name)
  if (index !== -1) {
    kingdomState.cards[index] = randomCard
  }
}
