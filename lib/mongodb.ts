import mongoose from "mongoose"

const DEFAULT_LOCAL_MONGODB_URI = "mongodb://localhost:27017/Mini-project"

function getMongoUri() {
  const uri = process.env.MONGODB_URI
  if (uri) return uri

  // Never fall back to localhost in deployments (e.g. Vercel).
  if (process.env.NODE_ENV === "production") {
    throw new Error("MONGODB_URI is not defined")
  }

  return DEFAULT_LOCAL_MONGODB_URI
}

let connectionPromise: Promise<typeof mongoose> | null = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getMongoUri())
  }
  await connectionPromise
}