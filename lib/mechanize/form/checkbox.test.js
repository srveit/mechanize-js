import { newPage } from '../page.js'
import { fixture } from '../../../spec/helpers/fixture.js'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Mechanize/Form/Checkbox', () => {
  let checkbox, form

  beforeEach(async () => {
    const body = await fixture('form_elements.html')
    const page = newPage({
      body,
    })

    form = page.form('form1')
  })

  describe('checked check box', () => {
    beforeEach(() => {
      checkbox = form.checkbox('checkboxChecked')
    })

    it('should be checked', () => expect(checkbox.isChecked()).toEqual(true))
  })

  describe('unchecked check box', () => {
    beforeEach(() => {
      checkbox = form.checkbox('checkboxUnchecked')
    })

    it('should be unchecked', () => expect(checkbox.isChecked()).toEqual(false))
  })
})
