'use strict';
const {newAgent} = require('../lib/mechanize/agent'),
  {newPage} = require('../lib/mechanize/page');

describe('Mechanize/Page', () => {
  let response, body, page, userAgentVersion, userAgent, agent;

  beforeEach(() => {
    agent = newAgent();
    response = {
      headers: {
        'content-type': 'text/html; charset=ISO-8859-1'
      }
    };
    agent.setUserAgent('Mac Safari');
  });

  describe('with no body', () => {
    beforeEach(() => {
      page = newPage({response: {'content-type': 'text/html'}, agent});
    });

    it('should be created', () => {
      expect(page).toEqual(jasmine.objectContaining({
        at: jasmine.any(Function),
        body: undefined,
        code: undefined,
        doc: undefined,
        form: jasmine.any(Function),
        labelFor: jasmine.any(Function),
        links: jasmine.any(Function),
        responseHeaderCharset: jasmine.any(Function),
        search: jasmine.any(Function),
        statusCode: jasmine.any(Function),
        submit: jasmine.any(Function),
        title: jasmine.any(Function),
        uri: 'local:/',
        userAgent: jasmine.any(Function),
        userAgentVersion: undefined
      }));
    });
  });

  describe('with form', () => {
    let form;
    beforeEach(() => {
      body = fixture('login.html');
      page = newPage({response, body, agent});
      form = page.form('MAINFORM');
    });

    it('should exist', () => {
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

    it('should return form', () => {
      expect(form).toEqual(jasmine.objectContaining({
        addField: jasmine.any(Function),
        buildQuery: jasmine.any(Function),
        checkbox: jasmine.any(Function),
        deleteField: jasmine.any(Function),
        field: jasmine.any(Function),
        fieldValue: jasmine.any(Function),
        labelFor: jasmine.any(Function),
        name: 'MAINFORM',
        page: jasmine.any(Object),
        requestData: jasmine.any(Function),
        setFieldValue: jasmine.any(Function),
        submit: jasmine.any(Function),
        submitButton: jasmine.any(Function)
      }));
    });

    it('should return user agent', () => {
      expect(page.userAgent()).toMatch(/Mozilla/);
    });

    it('should have a title', () => {
      expect(page.title()).toEqual('Welcome');
    });

    it('should have responseHeaderCharset', () => {
      expect(page.responseHeaderCharset()).toEqual(['ISO-8859-1']);
    });
  });

  describe('with links', () => {
    beforeEach(() => {
      body = fixture('links.html');
      page = newPage({response, body, agent});
    });

    it('should return links', () => {
      console.log('page.uri', page.uri);
      expect(page.links().length).toEqual(11);
    });

    it('should href', () => {
      expect(page.links()[0].href)
        .toBe('http://www.example.com/about/contact/contact.asp');
    });

    it('should have search', () => {
      expect(page.search('//a').length).toEqual(11);
    });
  });

  describe('with null parsed body', () => {
    let uri, response;
    beforeEach(() => {
      uri = 'https://login.yahoo.com/config/login?';
      response = {
        headers: {
          location: 'https://login.yahoo.com/config/verify?.done=' +
            'http%3a//us.mg206.mail.yahoo.com/dc/launch%3f.partner=' +
            'sbc%26.gx=0%26.rand=e7cfrljanjnfa',
          'content-type': 'text/html'
        },
        statusCode: 302,
        body: body
      };

      body = fixture('xml-comment.html');
      page = newPage({uri, response, body, agent});
    });

    it('should not have search', () => {
      expect(page.search('//a').length).toEqual(0);
    });

    it('should have statusCode', () => {
      expect(page.statusCode()).toEqual(302);
    });
  });
});
