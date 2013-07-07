var Agent = require('../lib/mechanize/agent');
var Cookie = require('cookiejar').Cookie;
var CookieAccessInfo = require('cookiejar').CookieAccessInfo;


describe("Mechanize/Agent", function () {
  var agent, options, response, responseBody, requestOptions, responseErr,
    responsePage;

  beforeEach(function () {
    agent = new Agent();
    agent.userAgentAlias = 'My agent';
    requestOptions = null;
    response = {
      statusCode: '200'
    };
    agent.request = function (options, fn) {
      requestOptions = options;
      fn(null, response, responseBody);
    };
    options = {
      uri: 'http://example.com/'
    };
  });

  it("should have a cookieJar", function () {
    agent.cookieJar.should.exist;
  });

  context("getting page", function () {
    var domain, uri;

    beforeEach(function () {
      domain = 'example.com';
      uri = 'http://example.com/index.html';
    });

    context("with meta cookies", function () {
      beforeEach(function () {
        responseBody = fixture("meta_cookies.html");
        agent.get({uri: uri}, function (err, page) {
          responseErr = err;
          responsePage = page;
        });
      });

      it("should set cookies", function () {
        var accessInfo, cookies;
        accessInfo = new CookieAccessInfo(domain, '/', true, false);
        cookies = agent.cookieJar.getCookies(accessInfo);
        cookies.length.should.eql(2);
      });
    });

    context("with single header cookie", function () {
      beforeEach(function () {
        response = {
          statusCode: '200',
          headers: {
            'set-cookie': "sessionid=345; path=/; " +
              "expires=Fri, 01 Jan 2021 00:00:00 GMT; secure; HttpOnly"
          }
        };
        responseBody = fixture("login.html");
        agent.get({uri: uri}, function (err, page) {
          responseErr = err;
          responsePage = page;
        });
      });

      it("should set cookies", function () {
        var accessInfo, cookies;
        accessInfo = new CookieAccessInfo(domain, '/', true, false);
        cookies = agent.cookieJar.getCookies(accessInfo);
        cookies.length.should.eql(1);
      });
    });

    context("with header cookies", function () {
      beforeEach(function () {
        response = {
          statusCode: '200',
          headers: {
            'set-cookie': [
              "sessionid=345; path=/; " +
                "expires=Fri, 01 Jan 2021 00:00:00 GMT; secure; HttpOnly",
              "name=smith; path=/; " +
                "expires=Fri, 01 Jan 2021 00:00:00 GMT; secure; HttpOnly"
            ]
          }
        };
        responseBody = fixture("login.html");
        agent.get({uri: uri}, function (err, page) {
          responseErr = err;
          responsePage = page;
        });
      });

      it("should set cookies", function () {
        var accessInfo, cookies;
        accessInfo = new CookieAccessInfo(domain, '/', true, false);
        cookies = agent.cookieJar.getCookies(accessInfo);
        cookies.length.should.eql(2);
      });
    });

  });

  context("submitting form", function () {
    var form, submitErr, submitPage, referer, contentType, requestData;

    beforeEach(function () {
      requestData = 'userID=&name=&street=Main';
      form = {
        requestData: function () {
          return requestData;
        },
        addButtonToQuery: function () {}
      };
    });

    context("with partial URL", function () {
      beforeEach(function () {
        referer = "http://example.com/page";
        form.action = 'login';
        form.page = {uri: referer};
      });

      context("with POST method", function () {
        var cookie;

        beforeEach(function () {
          cookie = new Cookie("sessionid=123;domain=.example.com;path=/");
          agent.cookieJar.setCookie(cookie);
          contentType = 'application/x-www-form-urlencoded';
          form.method = 'POST';
          form.enctype = contentType;
          agent.submit(form, null, {}, {}, function (err, page) {
            submitErr = err;
            submitPage = page;
          });
        });

        it("should use URI", function () {
          requestOptions.uri.should.eql('http://example.com/login');
        });

        it("should have referer", function () {
          requestOptions.headers.Referer.should.eql(referer);
        });

        it("should have origin", function () {
          requestOptions.headers.Origin.should.eql('http://example.com');
        });

        it("should have user agent", function () {
          requestOptions.headers['User-Agent'].should.eql('My agent');
        });

        it("should have content type", function () {
          requestOptions.headers['Content-Type'].should.eql(contentType);
        });

        it("should have content length", function () {
          requestOptions.headers['Content-Length'].should.eql('25');
        });

        it("should have cookie", function () {
          requestOptions.headers.Cookie.should.eql('sessionid=123');
        });

        it("should have accept", function () {
          requestOptions.headers.Accept.should.eql('*/*');
        });

        it("should have body", function () {
          requestOptions.body.should.eql(requestData);
        });

      });
    });

    context("with full URL", function () {
      beforeEach(function () {
        form.action = 'http://example.com/login';
      });

      context("with POST method", function () {
        beforeEach(function () {
          form.method = 'POST';
          agent.submit(form, null, {}, {}, function (err, page) {
            submitErr = err;
            submitPage = page;
          });
        });

        it("should use URI", function () {
          requestOptions.uri.should.eql('http://example.com/login');
        });

        it("should post form", function () {
          requestOptions.method.should.eql('POST');
        });

        it("should post form fields in body", function () {
          requestOptions.body.should.eql(requestData);
        });

      });
    });
  });
});
