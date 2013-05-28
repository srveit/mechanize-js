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

  context("text link", function () {
    beforeEach(function () {
      node = page.at("//a[1]");
      href = 'http://example.com/first';
      nodeID = 'first';
      link = new Link(page, node);
    });

    it("should exist", function () {
      link.should.exist;
    });

    it("should have href", function () {
      link.href.should.eql(href);
    });

    it("should have domID", function () {
      link.domID.should.eql(nodeID);
    });

    it("should have text", function () {
      link.text.should.eql('Example');
    });
  });

  context("image link", function () {
    beforeEach(function () {
      node = page.at("//a[2]");
      href = 'http://example.com/second';
      nodeID = 'second';
      link = new Link(page, node);
    });

    it("should exist", function () {
      link.should.exist;
    });

    it("should have href", function () {
      link.href.should.eql(href);
    });

    it("should have domID", function () {
      link.domID.should.eql(nodeID);
    });

    it("should have text", function () {
      link.text.should.eql('picture');
    });
  });
});
