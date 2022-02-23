'use strict';
const {newAgent} = require('../lib/mechanize/agent'),
  {newPage} = require('../lib/mechanize/page'),
  {fixture} = require('./helpers/fixture.js');

describe('Mechanize/Page', () => {
  let response, body, page, agent;

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
      page = newPage({
        response: {
          'content-type': 'text/html'
        },
        agent
      });
    });

    it('should be created', () => {
      expect(page).toEqual(expect.objectContaining({
        at: expect.any(Function),
        body: undefined,
        doc: expect.any(Object),
        form: expect.any(Function),
        labelFor: expect.any(Function),
        links: expect.any(Function),
        responseHeaderCharset: expect.any(Function),
        search: expect.any(Function),
        statusCode: expect.any(Function),
        submit: expect.any(Function),
        title: expect.any(Function),
        uri: 'local:/',
        userAgent: expect.any(Function),
        userAgentVersion: undefined
      }));
    });
  });

  describe('with form', () => {
    let form;
    beforeEach(async () => {
      body = await fixture('login.html');
      page = newPage({
        response, body, agent
      });
      form = page.form('MAINFORM');
    });

    it('should exist', () => {
      expect(page).toEqual(expect.objectContaining({
        at: expect.any(Function),
        form: expect.any(Function),
        labelFor: expect.any(Function),
        links: expect.any(Function),
        responseHeaderCharset: expect.any(Function),
        search: expect.any(Function),
        statusCode: expect.any(Function),
        submit: expect.any(Function),
        title: expect.any(Function)
      }));
    });

    it('should return form', () => {
      expect(form).toEqual(expect.objectContaining({
        addField: expect.any(Function),
        buildQuery: expect.any(Function),
        checkbox: expect.any(Function),
        deleteField: expect.any(Function),
        field: expect.any(Function),
        fieldValue: expect.any(Function),
        labelFor: expect.any(Function),
        name: 'MAINFORM',
        page: expect.any(Object),
        requestData: expect.any(Function),
        setFieldValue: expect.any(Function),
        submit: expect.any(Function),
        submitButton: expect.any(Function)
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
    beforeEach(async () => {
      body = await fixture('links.html');
      page = newPage({
        response, body, agent
      });
    });

    it('should return links', () => {
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
    beforeEach(async () => {
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

      body = await fixture('xml-comment.html');
      page = newPage({
        uri, response, body, agent
      });
    });

    it('should not have search', () => {
      expect(page.search('//a').length).toEqual(0);
    });

    it('should have statusCode', () => {
      expect(page.statusCode()).toEqual(302);
    });
  });
});
