var Page = require('../lib/mechanize/page');


describe('Mechanize/Page', function () {
  var response, body, page, userAgentVersion, userAgent, agent, uri, code;

  beforeEach(function () {
    agent = {};
    uri = null;
    code = null;
    response = {
      headers: {
        'content-type': 'text/html; charset=ISO-8859-1'
      }
    };
    userAgentVersion = '5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/' +
      '534.30 (KHTML, like Gecko) Chrome/12.0.742.77 Safari/534.30';
    userAgent = 'Mozilla/' + userAgentVersion;
    agent.userAgentVersion = userAgentVersion;
    agent.userAgent = userAgent;
  });

  context("with no body", function () {
    beforeEach(function () {
      page = new Page(null, {'content-type': 'text/html'}, null, null, agent);
    });

    it("should be created", function () {
      page.should.exist;
    });
  });

  context("with form", function () {
    beforeEach(function () {
      body = fixture('login.html');
      page = new Page(uri, response, body, code, agent);
    });

    it("should exist", function () {
      page.should.exist;
    });

    it("should return form", function () {
      var form = page.form('MAINFORM');
      form.should.exist;
    });

    it("should return user agent", function () {
      page.userAgent.should.eql(userAgent);
    });

    it("should have a title", function () {
      page.title.should.eql("Welcome");
    });

    it("should have responseHeaderCharset", function () {
      page.responseHeaderCharset.should.eql(["ISO-8859-1"]);
    });
  });

  context("with links", function () {
    beforeEach(function () {
      body = fixture('links.html');
      page = new Page(uri, response, body, code, agent);
    });

    it("should return links", function () {
      page.links().length.should.eql(11);
    });

    it("should have serach", function () {
      page.search('//a').length.should.eql(11);
    });
  });

  context("with null parsed body", function () {
    beforeEach(function () {
      var uri = 'https://login.yahoo.com/config/login?',
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
      page = new Page(uri, response, body, code, agent);
    });

    it("should have serach", function () {
      page.search('//a').length.should.eql(0);
    });

    it("should have statusCode", function () {
      page.statusCode().should.eql(302);
    });
  });
});
