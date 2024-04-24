'use strict'
import { newPage } from '../lib/mechanize/page'
import { fixture } from './helpers/fixture.js'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Mechanize/Form/Text', () => {
  let text, form
  beforeEach(async () => {
    const url = 'form.html'
    const body = await fixture('form_elements.html')
    const page = newPage({
      url, body,
    })

    form = page.form('form1')
  })

  describe('text field', () => {
    beforeEach(() => {
      text = form.field('text')
    })

    it('should not be disabled', () => {
      expect(text.disabled).toEqual(false)
    })
  })

  describe('disabled text field', () => {
    beforeEach(() => {
      text = form.field('textDisabled')
    })

    it('should be disabled', () => {
      expect(text.disabled).toEqual(true)
    })
  })
})
