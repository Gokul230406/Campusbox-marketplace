import mongoose from "mongoose"

const MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://localhost:27017/Mini-project"

let connectionPromise: Promise<typeof mongoose> | null = null

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI)
  }
  await connectionPromise
}