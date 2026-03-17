import { describe, expect, it } from 'vitest'

describe('test environment', () => {
  it('provides a browser-like DOM', () => {
    const element = document.createElement('section')

    element.dataset.state = 'ready'

    expect(element.dataset.state).toBe('ready')
  })
})
