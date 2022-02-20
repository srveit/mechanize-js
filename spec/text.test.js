'use strict';
const {newPage} = require('../lib/mechanize/page'),
  {fixture} = require('./helpers/fixture.js');

describe('Mechanize/Form/Text', () => {
  let text, form;
  beforeEach(() => {
    const url = 'form.html';
    const body = fixture('form_elements.html');
    const page = newPage({
      url, body
    });

    form = page.form('form1');
  });

  describe('text field', () => {
    beforeEach(() => {
      text = form.field('text');
    });

    it('should not be disabled', () => {
      expect(text.disabled).toEqual(false);
    });
  });

  describe('disabled text field', () => {
    beforeEach(() => {
      text = form.field('textDisabled');
    });

    it('should be disabled', () => {
      expect(text.disabled).toEqual(true);
    });
  });
});