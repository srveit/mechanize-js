'use strict';
const {newLink} = require('../lib/mechanize/page/link'),
  {newPage} = require('../lib/mechanize/page');

describe('Mechanize/Page/Link', () => {
  let link, href, nodeID, page, node;

  beforeEach(() => {
    const agent = {};
    const body = '<html><body>' +
      '<a id="first" href="http://example.com/first">Example</a>' +
      '<a id="second" href="http://example.com/second">' +
      '<img src="picture.png" alt="picture"/></a>' +
      '</body></html>';
    page = newPage({
      body, agent
    });
  });

  describe('text link', () => {
    beforeEach(() => {
      node = page.at('//a[1]');
      href = 'http://example.com/first';
      nodeID = 'first';
      link = newLink(node, page);
    });

    it('should exist', () => {
      expect(link).toEqual(expect.objectContaining({
        text: expect.any(Function)
      }));
    });

    it('should have href', () => {
      expect(link.href).toEqual(href);
    });

    it('should have domId', () => {
      expect(link.domId).toEqual(nodeID);
    });

    it('should have text', () => {
      expect(link.text()).toEqual('Example');
    });
  });

  describe('image link', () => {
    beforeEach(() => {
      node = page.at('//a[2]');
      href = 'http://example.com/second';
      nodeID = 'second';
      link = newLink(node, page);
    });

    it('should exist', () => {
      expect(link).toEqual(expect.objectContaining({
        text: expect.any(Function)
      }));
    });

    it('should have href', () => {
      expect(link.href).toEqual(href);
    });

    it('should have domId', () => {
      expect(link.domId).toEqual(nodeID);
    });

    it('should have text', () => {
      expect(link.text()).toEqual('picture');
    });
  });
});
