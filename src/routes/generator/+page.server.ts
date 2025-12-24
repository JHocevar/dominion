import clientPromise from "$lib/server/mongodb.server"
import type { Kingdom } from "$lib/state/kingdom.svelte.js"
import type { PageServerLoad } from './$types'

async function loadKingdomByKey(key: string): Promise<any | null> {
	const client = await clientPromise
	const db = client.db()

	try {
		const { ObjectId } = await import('mongodb')
		if (ObjectId.isValid(key)) {
			const doc = await db.collection('kingdomData').findOne({ _id: new ObjectId(key) })
			if (doc) return doc
			return ''
		}
	} catch (err) {
		console.debug('Not an ObjectId or error parsing ObjectId:', err)
	}
}

export const load: PageServerLoad<{ kingdom: Kingdom | null }> = async ({ url }) => {
	const kingdomId = url.searchParams.get('kingdomId')

	if (!kingdomId) return { kingdom: null }

	console.debug('Loading kingdom for key:', kingdomId)
	const kingdom = await loadKingdomByKey(kingdomId)

	if (!kingdom) return { kingdom: null }

	// convert non-POJOs (ObjectId) to serializable values
	const safe: any = { ...kingdom }
	if (safe._id && typeof safe._id === 'object' && typeof safe._id.toString === 'function') {
		safe._id = safe._id.toString()
	}

	return { kingdom: safe }
}