import { json } from '@sveltejs/kit'
import type { RequestHandler } from "./$types"
import clientPromise from "$lib/server/mongodb"
import { ObjectId } from 'mongodb'

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth()

  if (!session?.user?.id) {
    return json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { settings, kingdom, stats } = await request.json()

    const client = await clientPromise
    const db = client.db()
    const userId = new ObjectId(session.user.id)
    const now = new Date()

    await db.collection('gameData').updateOne(
      { userId },
      {
        $set: {
          settings,
          kingdom,
          stats,
          updatedAt: now
        },
        $setOnInsert: {
          userId,
          createdAt: now
        }
      },
      { upsert: true }
    )

    return json({ success: true })
  } catch (error) {
    console.error('Error saving game data to database:', error)
    return json({ error: 'Failed to save game data' }, { status: 500 })
  }
}