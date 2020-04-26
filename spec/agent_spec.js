'use strict';
const {newAgent} = require('../lib/mechanize/agent'),
 {Cookie, CookieAccessInfo} = require('cookiejar'),
 {URL} = require('url');

describe('Mechanize/Agent', () => {
  let server, host, domain, baseUrl, agent, requestOptions;

  beforeAll(done => {
    server = mockServer();
    server.start(done);
  });
  afterAll(done => server.stop(done));
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL;
    host = process.env.SERVER_HOST;
    const url = new URL(baseUrl);
    domain = url.hostname;
    agent = newAgent();
  });

  it('should have a userAgent', () =>
     expect(agent.userAgent()).toEqual(jasmine.any(String)));

  describe('getting page', () => {
    let uri;

    beforeEach(() => {
      uri = baseUrl + '/page.html';
    });

    describe('with meta cookies', () => {
      beforeEach(done => {
        const responseBody = fixture('meta_cookies.html');
        server.getPage.and.returnValue(responseBody);
        agent.get({uri})
          .then(() => done())
          .catch(error => {
            console.error('error getting page', error);
            done();
          });
      });

      it('should set cookies', () => {
        const cookies = agent.getCookies({domain});
        expect(cookies.length).toEqual(2);
      });
    });

    describe('with single header cookie', () => {
      beforeEach(done => {
        const responseBody = fixture('login.html');
        server.getPage.and.returnValue({
          headers: {
            'set-cookie': 'sessionid=345; path=/; ' +
              'expires=Fri, 01 Jan 2021 00:00:00 GMT; secure; HttpOnly'
          },
          body: responseBody
        });
        agent.get({uri})
          .then(() => done())
          .catch(error => {
            console.error('error getting page', error);
            done();
          });
      });

      it('should set cookies', () => {
        const cookies = agent.getCookies({domain});
        expect(cookies.length).toEqual(1);
      });
    });

    describe('with header cookies', () => {
      beforeEach(done => {
        const responseBody = fixture('login.html');
        server.getPage.and.returnValue({
          headers: {
            'set-cookie': [
              'sessionid=345; path=/; ' +
                'expires=Fri, 01 Jan 2021 00:00:00 GMT; secure; HttpOnly',
              'name=smith; path=/; ' +
                'expires=Fri, 01 Jan 2021 00:00:00 GMT; secure; HttpOnly'
            ]
          },
          body: responseBody
        });
        agent.get({uri})
          .then(() => done())
          .catch(error => {
            console.error('error getting page', error);
            done();
          });
      });

      it('should set cookies', () => {
        const cookies = agent.getCookies({domain});
        expect(cookies.length).toEqual(2);
      });
    });
  });

  describe('getting page with form', () => {
    let uri, form;
    beforeEach(done => {
      uri = baseUrl + '/page.html';
      const responseBody = fixture('login.html');
      server.getPage.and.returnValue(responseBody);
      agent.get({uri})
        .then(page => {
          form = page.form('MAINFORM');
          done();
        })
        .catch(error => {
          console.error('error getting page', error);
          done();
        });
    });

    it('should have a form', () => {
      expect(form).toEqual(jasmine.objectContaining({
        action: 'Login.aspx',
        addButtonToQuery: jasmine.any(Function),
        addField: jasmine.any(Function),
        buildQuery: jasmine.any(Function),
        checkbox: jasmine.any(Function),
        deleteField: jasmine.any(Function),
        enctype: 'application/x-www-form-urlencoded',
        field: jasmine.any(Function),
        labelFor: jasmine.any(Function),
        method: 'post',
        name: 'MAINFORM',
        noValidate: false,
        page: jasmine.any(Object),
        requestData: jasmine.any(Function),
        setFieldValue: jasmine.any(Function),
        submit: jasmine.any(Function),
        target: null
      }));
    });

    describe('then submitting form', () => {
      let cookie, contentType, submitPage, submitError;

      beforeEach(done => {
        server.postForm.calls.reset();
        cookie = new Cookie('sessionid=123;domain=' + domain + ';path=/');
        agent.setCookie(cookie);
        agent.submit({form})
          .then(page => submitPage = page)
          .catch(error => submitError = error)
          .then(() => done());
      });

      it('should post the form', () => {
        expect(server.postForm).toHaveBeenCalledWith({
          path: '/Login.aspx',
          headers: {
            'user-agent': jasmine.stringMatching(
                /Mechanize\/[.0-9]+ Node.js\/v[.0-9]+ \(http:\/\/github.com\/srveit\/mechanize-js\/\)/),
            accept: '*/*',
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': '25',
            referer: baseUrl + '/page.html',
            origin: baseUrl,
            'accept-encoding': 'gzip, deflate, br',
            cookie: 'sessionid=123',
            host: host,
            connection: 'close'
          },
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
