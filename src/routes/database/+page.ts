import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { loadAllCards } from '$lib/functions/cards'

export const load: PageLoad = ({ params }) => {
    try {
        const records = loadAllCards()

        return {
            firstCard: records[0],
            allCards: records,
        }
    } catch (e) {
        console.error("Error loading card data:", e)
        throw error(500, "Failed to load card data")
    }
}
