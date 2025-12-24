import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import clientPromise from '$lib/server/mongodb.server'
import { ObjectId } from 'mongodb'

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth()

  if (!session?.user?.id) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const client = await clientPromise
    const db = client.db()

    const userData = await db.collection('userData').findOne({
      userId: new ObjectId(session.user.id)
    })

    if (!userData) {
      return json({ settings: null, kingdom: null})
    }

    return json({
      settings: userData.settings,
      kingdom: userData.kingdom,
      stats: userData.stats,
      updatedAt: userData.updatedAt
    })
  } catch (error) {
    console.error('Error loading game data:', error)
    return json({ error: 'Failed to load game data' }, { status: 500 })
  }
}