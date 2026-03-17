import { describe, expect, it } from 'vitest'
import { defaultCategories } from './seed'

describe('defaultCategories', () => {
  it('ships the 11 base purchasing categories', () => {
    expect(defaultCategories).toHaveLength(11)
    expect(defaultCategories[0]).toMatchObject({
      name: 'Aceite',
      sortOrder: 1,
    })
    expect(defaultCategories.at(-1)).toMatchObject({
      name: 'Otros',
      sortOrder: 99,
    })
  })

  it('keeps categories sorted by ascending sort order', () => {
    const sortOrders = defaultCategories.map((category) => category.sortOrder)
    const sortedSortOrders = [...sortOrders].sort((left, right) => left - right)

    expect(sortOrders).toEqual(sortedSortOrders)
  })
})
