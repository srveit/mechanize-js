'use strict';
const {newPage} = require('../lib/mechanize/page');

describe('Mechanize/Form/Checkbox', () => {
  var checkbox, form;

  beforeEach(() => {
    var uri, body, page;

    uri = 'form.html';
    body = fixture('form_elements.html');
    page = newPage({body});

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
