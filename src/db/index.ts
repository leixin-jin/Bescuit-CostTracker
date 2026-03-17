import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export function getDb(client: D1Database) {
  return drizzle(client, { schema })
}

export type AppDb = ReturnType<typeof getDb>

export { schema }
