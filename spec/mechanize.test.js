'use strict'
import { newAgent, newPage } from '../lib/mechanize'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Mechanize', () => {
  let agent, page
  beforeEach(() => {
    agent = newAgent()
    page = newPage({})
  })
  it('should have newAgent', () => {
    expect(agent).toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        getCookies: expect.any(Function),
        setCookie: expect.any(Function),
        setUserAgent: expect.any(Function),
        submit: expect.any(Function),
        userAgent: expect.any(Function),
      })
    )
  })
  it('should have newPage', () => {
    expect(page).toEqual(
      expect.objectContaining({
        at: expect.any(Function),
        form: expect.any(Function),
        labelFor: expect.any(Function),
        links: expect.any(Function),
        responseHeaderCharset: expect.any(Function),
        search: expect.any(Function),
        statusCode: expect.any(Function),
        submit: expect.any(Function),
        title: expect.any(Function),
      })
    )
  })
})
