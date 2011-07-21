var Page = require('../lib/mechanize/page');


describe('Mechanize/Page', function () {
  var response, body, page, userAgentVersion, userAgent;

  beforeEach(function () {
    var agent = {},
    uri = null,
    code = null;
    response = {};
    userAgentVersion = '5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/' +
      '534.30 (KHTML, like Gecko) Chrome/12.0.742.77 Safari/534.30';
    userAgent = 'Mozilla/' + userAgentVersion;
    agent.userAgentVersion = userAgentVersion;
    agent.userAgent = userAgent;
    body = fixture('login.html');
    page = new Page(agent, uri, response, body, code);
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

  it("should return links", function () {
    page.links().length.should.eql(12);
  });
});
