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

  context('with no body', function () {
    beforeEach(function () {
      page = new Page(null, {'content-type': 'text/html'}, null, null, agent);
    });

    it('should be created', function () {
      expect(page).not.toBe(undefined);
    });
  });

  context('with form', function () {
    beforeEach(function () {
      body = fixture('login.html');
      page = new Page(uri, response, body, code, agent);
    });

    it('should exist', function () {
      expect(page).not.toBe(undefined);
    });

    it('should return form', function () {
      var form = page.form('MAINFORM');
      expect(form).not.toBe(undefined);
    });

    it('should return user agent', function () {
      expect(page.userAgent).toEqual(userAgent);
    });

    it('should have a title', function () {
      expect(page.title).toEqual('Welcome');
    });

    it('should have responseHeaderCharset', function () {
      expect(page.responseHeaderCharset).toEqual(['ISO-8859-1']);
    });
  });

  context('with links', function () {
    beforeEach(function () {
      body = fixture('links.html');
      page = new Page(uri, response, body, code, agent);
    });

    it('should return links', function () {
      expect(page.links().length).toEqual(11);
    });

    it('should have search', function () {
      expect(page.search('//a').length).toEqual(11);
    });
  });

  context('with null parsed body', function () {
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

    it('should not have search', function () {
      expect(page.search('//a').length).toEqual(0);
    });

    it('should have statusCode', function () {
      expect(page.statusCode()).toEqual(302);
    });
  });
});
