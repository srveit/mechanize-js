'use strict';
const {newPage} = require('../lib/mechanize/page');

describe('Mechanize/Form/Text', () => {
  let text, form;
  beforeEach(() => {
    let url, response, body, code, page;
    agent = newAgent();
    url = 'form.html';
    body = fixture('form_elements.html');
    page = newPage({url, body});

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
