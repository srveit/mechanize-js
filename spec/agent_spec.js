var Agent = require('../lib/mechanize/agent'),
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

  context("getting page", function () {
    beforeEach(function () {
      agent.get({uri: 'http://example.com/index.html'}, function (err, page) {
        responseErr = err;
        responsePage = page;
      });
    });

    it("should have referer", function () {
      console.log("requestOptions: " + require('sys').inspect(requestOptions));
//      requestOptions.headers.Host.should.eql('example.com');
    });

  });

  context("submitting form", function () {
    var form, submitErr, submitPage, referrer, contentType;

    beforeEach(function () {
      form = {
        requestData: function () {
          return "";
        },
        addButtonToQuery: function () {}
      };
    });

    context("with partial URL", function () {
      beforeEach(function () {
        referrer = "http://example.com/page";
        form.action = 'login';
        form.page = {uri: referrer};
      });

      context("with POST method", function () {
        beforeEach(function () {
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
          requestOptions.headers.Referer.should.eql(referrer);
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
          requestOptions.headers['Content-Length'].should.eql('0');
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
