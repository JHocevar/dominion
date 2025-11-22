type SettingsState = {
  version: string
  sets: Record<string, Set>
  platinumChance: number
  platinumChanceNoCards: number
  shelterChance: number
  shelterChanceNoCards: number
  requireVillage: boolean
  requireDraw: boolean
  disableAttack: boolean
  requireReaction: boolean
  requireTrashing: boolean
  bannedCards: string[]
  hideLoginIcon: boolean
  hideThemeIcon: boolean
  eventLikeCardsMaster: { enabled: boolean; amount: number }
  eventLikeCards: Record<string, { enabled: boolean; min: number; max: number }>
}

type Set = {
  name: string
  hidden: boolean
  enabled: boolean
  cardCount: number
  secondEdition: boolean
  secondEditionEnabled?: boolean
  secondEditionCardCount?: number
  weight: number
  minCards: number
}

// Taken from https://wiki.dominionstrategy.com/index.php/Sets
// (Note that Cornucopia and Guilds are together because they are now sold together)
export const settingsState = $state<SettingsState>({
  version: "1.45",
  sets: {
    Base: {
      name: "Base",
      enabled: true,
      hidden: false,
      cardCount: 500,
      secondEdition: true,
      secondEditionEnabled: true,
      weight: 1,
      minCards: 0,
    },
    Intrigue: {
      name: "Intrigue",
      enabled: false,
      hidden: false,
      cardCount: 500,
      secondEdition: true,
      secondEditionEnabled: true,
      secondEditionCardCount: 300,
      weight: 1,
      minCards: 0,
    },
    Seaside: {
      name: "Seaside",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: true,
      secondEditionEnabled: true,
      weight: 1,
      minCards: 0,
    },
    Alchemy: {
      name: "Alchemy",
      enabled: false,
      hidden: false,
      cardCount: 150,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Prosperity: {
      name: "Prosperity",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: true,
      secondEditionEnabled: true,
      weight: 1,
      minCards: 0,
    },
    Hinterlands: {
      name: "Hinterlands",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: true,
      secondEditionEnabled: true,
      weight: 1,
      minCards: 0,
    },
    DarkAges: {
      name: "Dark Ages",
      enabled: false,
      hidden: false,
      cardCount: 500,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Adventures: {
      name: "Adventures",
      enabled: false,
      hidden: false,
      cardCount: 400,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Empires: {
      name: "Empires",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Nocturne: {
      name: "Nocturne",
      enabled: false,
      hidden: false,
      cardCount: 500,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Renaissance: {
      name: "Renaissance",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Menagerie: {
      name: "Menagerie",
      enabled: false,
      hidden: false,
      cardCount: 400,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Allies: {
      name: "Allies",
      enabled: false,
      hidden: false,
      cardCount: 400,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    Plunder: {
      name: "Plunder",
      enabled: false,
      hidden: false,
      cardCount: 500,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    CornucopiaGuilds: {
      name: "Cornucopia & Guilds",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
    RisingSun: {
      name: "Rising Sun",
      enabled: false,
      hidden: false,
      cardCount: 300,
      secondEdition: false,
      weight: 1,
      minCards: 0,
    },
  },
  platinumChance: 0.2,
  platinumChanceNoCards: 0.05,
  shelterChance: 0.15,
  shelterChanceNoCards: 0.05,
  requireVillage: false,
  requireDraw: false,
  disableAttack: false,
  requireReaction: false,
  requireTrashing: false,
  bannedCards: [],
  hideLoginIcon: false,
  hideThemeIcon: false,
  eventLikeCardsMaster: {
    enabled: true,
    amount: 2
  },
  eventLikeCards: {
    Event: {
      enabled: true,
      min: 0,
      max: 20,
    },
    Landmark: {
      enabled: true,
      min: 0,
      max: 20,
    },
    Project: {
      enabled: true,
      min: 0,
      max: 20,
    },
    Way: {
      enabled: true,
      min: 0,
      max: 20,
    },
    Trait: {
      enabled: true,
      min: 0,
      max: 20,
    },
    Prophecy: {
      enabled: true,
      min: 0,
      max: 20,
    },
  },
})
