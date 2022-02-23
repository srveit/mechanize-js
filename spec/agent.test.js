'use strict';
const {newAgent} = require('../lib/mechanize/agent'),
  {URL} = require('url'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

const futureDate = 'Fri, 01 Jan 2023 00:00:00 GMT';

describe('Mechanize/Agent', () => {
  let server, host, domain, baseUrl, agent;

  beforeAll(async () => {
    server = mockServer([
      {
        method: 'post',
        path: '/',
        name: 'postForm'
      },
      {
        method: 'get',
        path: '/',
        name: 'getPage'
      }
    ]);
    await server.start();
  });
  afterAll(() => server.stop());
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL;
    host = process.env.SERVER_HOST;
    const url = new URL(baseUrl);
    domain = url.hostname;
    agent = newAgent();
  });

  it('should have a userAgent', () =>
    expect(agent.userAgent()).toEqual(expect.any(String)));

  describe('getting page', () => {
    let uri;

    beforeEach(() => {
      uri = baseUrl + '/page.html';
    });

    describe('with meta cookies', () => {
      beforeEach(async () => {
        const responseBody = await fixture('meta_cookies.html');
        server.getPage.mockReturnValueOnce(responseBody);
        await agent.get({
          uri
        });
      });

      it('should set cookies', async () => {
        const cookies = await agent.getCookies({
          domain
        });
        expect(cookies).toEqual([
          expect.objectContaining({
            key: 'sessionid',
            value: '345'
          }),
          expect.objectContaining({
            key: 'name',
            value: 'jones'
          })
        ]);
      });
    });

    describe('with single header cookie', () => {
      beforeEach(async () => {
        const responseBody = await fixture('login.html'),
          headers = {
            'set-cookie': 'sessionid=345; path=/; ' +
              `expires=${futureDate}; secure; HttpOnly`
          };

        server.getPage.mockReturnValueOnce({
          headers,
          body: responseBody
        });
        await agent.get({
          uri
        });
      });

      it('should set cookies', async () => {
        const cookies = await agent.getCookies({
          domain
        });
        expect(cookies).toEqual([
          expect.objectContaining({
            key: 'sessionid',
            value: '345'
          })
        ]);
      });
    });

    describe('with header cookies', () => {
      beforeEach(async () => {
        const responseBody = await fixture('login.html');
        server.getPage.mockReturnValueOnce({
          headers: {
            'set-cookie': [
              'sessionid=345; path=/; ' +
                `expires=${futureDate}; secure; HttpOnly`,
              'name=smith; path=/; ' +
                `expires=${futureDate}; secure; HttpOnly`
            ]
          },
          body: responseBody
        });
        await agent.get({
          uri
        });
      });

      it('should set cookies', async () => {
        const cookies = await agent.getCookies({
          domain
        });
        expect(cookies.length).toEqual(2);
      });
    });
  });

  describe('getting page with form', () => {
    let uri, form;
    beforeEach(async () => {
      uri = baseUrl + '/page.html';
      const responseBody = await fixture('login.html');
      server.getPage.mockReturnValueOnce(responseBody);
      const page = await agent.get({
        uri
      });
      form = page.form('MAINFORM');
    });

    it('should have a form', () => {
      expect(form).toEqual(expect.objectContaining({
        action: 'Login.aspx',
        addButtonToQuery: expect.any(Function),
        addField: expect.any(Function),
        buildQuery: expect.any(Function),
        checkbox: expect.any(Function),
        deleteField: expect.any(Function),
        enctype: 'application/x-www-form-urlencoded',
        field: expect.any(Function),
        labelFor: expect.any(Function),
        method: 'post',
        name: 'MAINFORM',
        noValidate: false,
        page: expect.any(Object),
        requestData: expect.any(Function),
        setFieldValue: expect.any(Function),
        submit: expect.any(Function),
        target: null
      }));
    });

    describe('then submitting form', () => {
      beforeEach(async () => {
        await agent.setCookie(`sessionid=1234;domain=${domain};path=/`, uri);
        await agent.setCookie(`name=bob`, uri);
        await agent.submit({
          form
        });
      });

      it('should post the form', () => {
        expect(server.postForm).toHaveBeenCalledWith({
          path: '/Login.aspx',
          headers: {
            'user-agent': expect.stringMatching(
              /Mechanize\/[.0-9]+ Node.js\/v[.0-9]+ \(http:\/\/github.com\/srveit\/mechanize-js\/\)/),
            accept: '*/*',
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': '25',
            referer: baseUrl + '/page.html',
            origin: baseUrl,
            'accept-encoding': 'gzip,deflate',
            cookie: 'sessionid=1234; name=bob',
            host: host,
            connection: 'close'
          },
          query: {},
          body: {
            userID: '',
            name: '',
            street: 'Main'
          }
        });
      });
    });
  });
});
