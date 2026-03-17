import { asc } from 'drizzle-orm'
import type { AppDb } from './index'
import { categories } from './schema'

export const defaultCategories = [
  { name: 'Aceite', icon: 'OL', sortOrder: 1 },
  { name: 'Carne', icon: 'ME', sortOrder: 2 },
  { name: 'Pescado', icon: 'FI', sortOrder: 3 },
  { name: 'Verdura', icon: 'VE', sortOrder: 4 },
  { name: 'Fruta', icon: 'FR', sortOrder: 5 },
  { name: 'Lácteo', icon: 'DA', sortOrder: 6 },
  { name: 'Bebida', icon: 'BE', sortOrder: 7 },
  { name: 'Panadería', icon: 'BA', sortOrder: 8 },
  { name: 'Conservas', icon: 'CA', sortOrder: 9 },
  { name: 'Limpieza', icon: 'CL', sortOrder: 10 },
  { name: 'Otros', icon: 'OT', sortOrder: 99 },
] as const

export async function seedDefaultCategories(db: AppDb) {
  await db
    .insert(categories)
    .values(defaultCategories.map((category) => ({ ...category })))
    .onConflictDoNothing()

  return db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name))
}
