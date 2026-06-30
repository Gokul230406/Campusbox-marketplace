import { neon } from "@neondatabase/serverless"

// Create a singleton instance of the SQL client
let sqlClient: ReturnType<typeof neon> | null = null

export function getSql() {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    sqlClient = neon(process.env.DATABASE_URL)
  }
  return sqlClient
}

export const sql = getSql()
