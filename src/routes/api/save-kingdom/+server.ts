import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import clientPromise from "$lib/server/mongodb.server"

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth()

  if (!session?.user?.id) {
    return json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { kingdom } = await request.json()

    const client = await clientPromise
    const db = client.db()

    const result = await db.collection('kingdomData').insertOne(kingdom)
    return json({ success: true, kingdomId: result.insertedId })
  } catch (error) {
    console.error('Error saving kingdom data:', error)
    return json({ error: 'Failed to save kingdom data' }, { status: 500})
  }
}