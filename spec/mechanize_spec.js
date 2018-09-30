'use strict';
const mechanize = require('../lib/mechanize');

describe('Mechanize', () => {
  let agent, page;
  beforeEach(() => {
     agent = mechanize.newAgent();
    page = mechanize.newPage({});
  });
  it('should have newAgent', () => {
    expect(agent).toEqual(jasmine.objectContaining({
      get: jasmine.any(Function),
      getCookies: jasmine.any(Function),
      setCookie: jasmine.any(Function),
      setUserAgent: jasmine.any(Function),
      submit: jasmine.any(Function),
      userAgent: jasmine.any(Function)
    }));
  });
  it('should have newPage', () => {
    expect(page).toEqual(jasmine.objectContaining({
      at: jasmine.any(Function),
      form: jasmine.any(Function),
      labelFor: jasmine.any(Function),
      links: jasmine.any(Function),
      responseHeaderCharset: jasmine.any(Function),
      search: jasmine.any(Function),
      statusCode: jasmine.any(Function),
      submit: jasmine.any(Function),
      title: jasmine.any(Function)
    }));
  });
});
