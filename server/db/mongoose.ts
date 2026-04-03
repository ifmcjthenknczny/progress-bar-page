import mongoose from 'mongoose'

declare global {
  // eslint-disable-next-line no-var
  var __mongooseConnectPromise: Promise<typeof mongoose> | undefined
}

export const ensureMongooseConnected = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) return mongoose
  if (!globalThis.__mongooseConnectPromise) {
    const dbName = process.env.MONGODB_DB
    globalThis.__mongooseConnectPromise = mongoose
      .connect(process.env.MONGODB_URI!, {
        autoIndex: false,
        dbName: dbName || undefined,
      })
      .then(() => mongoose)
  }

  return globalThis.__mongooseConnectPromise
}

