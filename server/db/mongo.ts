import { MongoClient, type Collection } from 'mongodb'

let clientPromise: Promise<MongoClient> | null = null

const getMongoClient = async (): Promise<MongoClient> => {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Missing env var MONGODB_URI')
  }

  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect()
  }

  return clientPromise
}

export const getMongoCollection = async <T = unknown>(collectionName: string): Promise<Collection<T>> => {
  const dbName = process.env.MONGODB_DB || 'progressdb'
  const client = await getMongoClient()
  const db = client.db(dbName)
  return db.collection<T>(collectionName)
}

