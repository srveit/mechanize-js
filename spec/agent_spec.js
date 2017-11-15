'use strict';
const {newAgent} = require('../lib/mechanize/agent'),
 {Cookie, CookieAccessInfo} = require('cookiejar'),
 {URL} = require('url');

describe('Mechanize/Agent', () => {
  let server, domain, baseUrl, agent, requestOptions;

  beforeAll(done => {
    server = mockServer();
    server.start(done);
  });
  afterAll(done => server.stop(done));
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL;
    const url = new URL(baseUrl);
    domain = url.hostname;
    agent = newAgent();
  });

  it('should have a userAgent', () => {
    expect(agent.userAgent()).toEqual(jasmine.any(String));
  });

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
            console.error('error getting page');
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
            console.error('error getting page');
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
            console.error('error getting page');
            done();
          });
      });

      it('should set cookies', () => {
        const cookies = agent.getCookies({domain});
        expect(cookies.length).toEqual(2);
      });
    });

  describe('submitting form', () => {
    var form, submitErr, submitPage,
      referer, contentType, requestData;

    beforeEach(() => {
      requestData = 'userID=&name=&street=Main';
      form = {
        requestData: () => {
          return requestData;
        },
        addButtonToQuery: () => {}
      };
    });

    describe('with partial URL', () => {
      beforeEach(() => {
        referer = 'http://example.com/page';
        form.action = 'login';
        form.page = {uri: referer};
      });

      describe('with POST method', () => {
        var cookie;

        beforeEach(() => {
          cookie = new Cookie('sessionid=123;domain=.example.com;path=/');
          agent.cookieJar.setCookie(cookie);
          contentType = 'application/x-www-form-urlencoded';
          form.method = 'POST';
          form.enctype = contentType;
          agent.submit(form, null, {}, {}, function (err, page) {
            submitErr = err;
            submitPage = page;
          });
        });

        it('should use URI', () => {
          expect(requestOptions.uri).toEqual('http://example.com/login');
        });

        it('should have referer', () => {
          expect(requestOptions.headers.Referer).toEqual(referer);
        });

        it('should have origin', () => {
          expect(requestOptions.headers.Origin).toEqual('http://example.com');
        });

        it('should have user agent', () => {
          expect(requestOptions.headers['User-Agent']).toEqual('My agent');
        });

        it('should have content type', () => {
          expect(requestOptions.headers['Content-Type']).toEqual(contentType);
        });

        it('should have content length', () => {
          expect(requestOptions.headers['Content-Length']).toEqual('25');
        });

        it('should have cookie', () => {
          expect(requestOptions.headers.Cookie).toEqual('sessionid=123');
        });

        it('should have accept', () => {
          expect(requestOptions.headers.Accept).toEqual('*/*');
        });

        it('should have body', () => {
          expect(requestOptions.body).toEqual(requestData);
        });

      });
    });

    describe('with full URL', () => {
      beforeEach(() => {
        form.action = 'http://example.com/login';
      });

      describe('with POST method', () => {
        beforeEach(() => {
          form.method = 'POST';
          agent.submit(form, null, {}, {}, function (err, page) {
            submitErr = err;
            submitPage = page;
          });
        });

        it('should use URI', () => {
          expect(requestOptions.uri).toEqual('http://example.com/login');
        });

        it('should post form', () => {
          expect(requestOptions.method).toEqual('POST');
        });

        it('should post form fields in body', () => {
          expect(requestOptions.body).toEqual(requestData);
        });

      });
    });
  });
});
