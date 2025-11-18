import { MongoClient } from "mongodb"
import { MONGODB_URI } from '$env/static/private'

const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// Global provider for HMR in dev mode
if (process.env.NODE_ENV) {
  let globalWithMongo = global as typeof globalThis & {
    _mongoCLientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoCLientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    globalWithMongo._mongoCLientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoCLientPromise
}
else {
  client = new MongoClient(MONGODB_URI, options)
  clientPromise = client.connect()
}

export default clientPromise