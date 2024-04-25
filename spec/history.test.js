import { newHistory } from '../lib/mechanize/history'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Mechanize/History', () => {
  let history

  beforeEach(() => {
    history = newHistory()
  })

  it('should exist', () => {
    expect(history).toEqual(
      expect.objectContaining({
        push: expect.any(Function),
        currentPage: expect.any(Function),
      })
    )
  })
})
