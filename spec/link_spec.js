var Link = require('../lib/mechanize/page/link');
var Page = require('../lib/mechanize/page');


describe('Mechanize/Page/Link', function () {
  var link, href, nodeID, page, node;

  beforeEach(function () {
    var agent, url, response, body, code;
    agent = {};
    url = null;
    response = {};
    body = '<html><body>' +
      '<a id="first" href="http://example.com/first">Example</a>' +
      '<a id="second" href="http://example.com/second">' +
      '<img src="picture.png" alt="picture"/></a>' +
      '</body></html>';
    code = null;
    page = new Page(url, response, body, code, agent);

  });

  context('text link', function () {
    beforeEach(function () {
      node = page.at('//a[1]');
      href = 'http://example.com/first';
      nodeID = 'first';
      link = new Link(page, node);
    });

    it('should exist', function () {
      expect(link).not.toBe(undefined);
    });

    it('should have href', function () {
      expect(link.href).toEqual(href);
    });

    it('should have domID', function () {
      expect(link.domID).toEqual(nodeID);
    });

    it('should have text', function () {
      expect(link.text).toEqual('Example');
    });
  });

  context('image link', function () {
    beforeEach(function () {
      node = page.at('//a[2]');
      href = 'http://example.com/second';
      nodeID = 'second';
      link = new Link(page, node);
    });

    it('should exist', function () {
      expect(link).not.toBe(undefined);
    });

    it('should have href', function () {
      expect(link.href).toEqual(href);
    });

    it('should have domID', function () {
      expect(link.domID).toEqual(nodeID);
    });

    it('should have text', function () {
      expect(link.text).toEqual('picture');
    });
  });
});
