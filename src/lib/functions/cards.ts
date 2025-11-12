import { parse as csvParse } from "csv-parse/browser/esm/sync"
import { parse as jsoncParse } from "jsonc-parser"
import cardsData from "$lib/data/cards.csv?raw"
import supplyJson from "$lib/data/supply.jsonc?raw"

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

const supply = jsoncParse(supplyJson)

// List of cards that appear in the table, but are not in the supply
export const nonSupplyCards: string[] = supply.nonSupplyCards

// Categories of cards that are not cards that even enter your deck
export const nonSupplyCategories: string[] = supply.nonSupplyCategories

// Supply piles with multiple cards in a single stack
export const specialMultiStackCards: string[] = supply.multiStackCards

export function loadAllCards(): Card[] {
  const records: Card[] = csvParse(cardsData, {
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
      !nonSupplyCategories.some((category) => card.Types.includes(category)) &&
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
