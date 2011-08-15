var Agent = require('../lib/mechanize/agent'),
Cookie = require('cookiejar').Cookie,
i = require('sys').inspect;


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
    beforeEach(function () {
      agent.get({uri: 'http://example.com/index.html'}, function (err, page) {
        responseErr = err;
        responsePage = page;
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
          agent.submit(form, function (err, page) {
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
          agent.submit(form, function (err, page) {
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

        it("should post form fileds in body", function () {
          requestOptions.body.should.eql(requestData);
        });

        // Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
        // Accept-Charset:ISO-8859-1,utf-8;q=0.7,*;q=0.3
        // Accept-Encoding:gzip,deflate,sdch
        // Accept-Language:en-US,en;q=0.8
        // Cache-Control:max-age=0
        // Connection:keep-alive
        // Cookie:__utmz=61007678.1305596160.17.2.utmccn=(referral)|utmcsr=banking.commercebank.com|utmcct=/CBI/login.aspx|utmcmd=referral; PMData=PMV5DWe%2FsxKTBOtqeUNOOdquqzzk7sbQ5DBq7xcybZGU%2FV55aZUkH9ZnDKWCeGaxEpzywJESltItBZ3P2H%2FjAb4Kmq5g%3D%3D; __utma=61007678.1044561854.1294586917.1307199932.1307209924.21; __utmb=61007678; __utmc=61007678; TestCookie=OK

      });
    });
  });
});
