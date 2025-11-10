import cardsData from "$lib/data/cards.csv?raw"
import { parse } from "csv-parse/browser/esm/sync"

export type Card = {
  Name: string
  Set: string
  Types: string
  Cost: number
  Text: string
  Actions: string
  Cards: string
  Buys: string
  Coins: string
  Trash: string
  Exile: string
  Junk: string
  Gain: string
  Victory: string
}

// List of cards that appear in the table, but are not in the supply
export const nonSupplyCards: string[] = [
  "Copper",
  "Silver",
  "Gold",
  "Platinum",
  "Estate",
  "Duchy",
  "Province",
  "Colony",
  "Curse",
  "Spoils",
  "Potion",
  "Ruins",
  "Horse",
  "Plunder",
  "Loot",

  // Add rotating and travelers here
]

// Categories of cards that are not cards that even enter your deck
export const nonSupplyCategory: string[] = [
  "Event",
  "Landmark",
  "Project",
  "Way",
  "Boon",
  "Hex",
  "State",
  "Ally",
  "Trait",
  "Prophecy",
]

export const specialMultiStackCards: string[] = [
  "Augur",  // Allies, Rotating pile
  "Fort",   // Allies, Rotating pile
  "Wizard", // Allies, Rotating pile
  "Clash",  // Allies, Rotating pile
  "Knight", // Dark Ages, each knight is unique
  "Castle", // Empires, each castle is unique
]

export function loadAllCards(): Card[] {
  const records: Card[] = parse(cardsData, {
    columns: true,
    skip_empty_lines: true,
    cast: (value, context) => {
      if (['Actions'].includes(context.column?.toString() || '')) {
        return value.replace('+', '')
      }
      return value
    }
  })
  return records
}

export function loadAllSupplyCards(): Card[] {
  const allCards = loadAllCards()
  const filteredCards = allCards.filter(
    (card) =>
      !nonSupplyCards.includes(card.Name) &&
      !nonSupplyCategory.some((category) => card.Types.includes(category)) &&
      !specialMultiStackCards.some((category) => card.Types.includes(category))
  )
  specialMultiStackCards.forEach((specialType) => {
    const example = allCards.find((card) => card.Types.includes(specialType))
    if (example) {
      filteredCards.push({
        Name: specialType,
        Set: example.Set,
        Types: example.Types,
        Cost: 0,
        Text: `This is a placeholder for the ${specialType} multi-stack pile.`,
        Actions: "",
        Cards: "",
        Buys: "",
        Coins: "",
        Trash: "",
        Exile: "",
        Junk: "",
        Gain: "",
        Victory: "",
      })
    }
  })
  return filteredCards
}
