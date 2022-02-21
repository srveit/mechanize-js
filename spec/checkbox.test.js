'use strict';
const {newPage} = require('../lib/mechanize/page'),
  {fixture} = require('./helpers/fixture.js');

describe('Mechanize/Form/Checkbox', () => {
  let checkbox, form;

  beforeEach(() => {
    const body = fixture('form_elements.html');
    const page = newPage({
      body
    });

    form = page.form('form1');

  });

  describe('checked check box', () => {
    beforeEach(() => {
      checkbox = form.checkbox('checkboxChecked');
    });

    it('should be checked', () =>
      expect(checkbox.isChecked()).toEqual(true));
  });

  describe('unchecked check box', () => {
    beforeEach(() => {
      checkbox = form.checkbox('checkboxUnchecked');
    });

    it('should be unchecked', () =>
      expect(checkbox.isChecked()).toEqual(false));
  });
});
