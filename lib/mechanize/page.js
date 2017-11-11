'use strict';
const libxml = require('libxmljs'),
  util = require('util'),
  Form = require('./form'),
  {newLink} = require('./page/link');

exports.newPage = (uri, response, body, code, agent) => {
  const doc = body && libxml.parseHtmlString(body),
    userAgent = agent.userAgent,
    userAgentVersion = agent.userAgentVersion,
    labels = {},  // TODO: initialize
    page = {};
  let title, links;

  page.title = () => {
    if (!title) {
      const node = this.doc.get('//title');
      title = node && node.text();
    }
    return title;
  };

  page.responseHeaderCharset = () => {
    const headers = response.headers || {},
      charsets = [];

    Object.keys(headers).forEach(function (header) {
      if (header) {
        const value = headers[header],
          m = value && /charset=([-().:_0-9a-zA-z]+)/.exec(value);
        if (m) {
          charsets.push(m[1]);
        }
      }
    });
    return charsets;
  };

  page.statusCode = () => response && response.statusCode;

  page.search = (xpath) => doc && doc.root() ? doc.find(xpath) : [];

  page.form = function (name) {
    const forms = doc.find('//form'),
      element = forms[name] || forms.find(element =>
        (element.attr('id') && element.attr('id').value() === name) ||
        (element.attr('name') && element.attr('name').value() === name));

    return element && new Form(page, forms[name]);
  };

  page.submit = (form, button, headers, requestOptions) =>
    agent.submit(form, button, headers, requestOptions);

  page.labelFor = id => this.labels[id];

  page.links = () => {
    if (!links) {
      links = [];
      ['a', 'area'].forEach(function (tag) {
        doc.find('//' + tag).forEach(function (node) {
          links.push(newLink(node));
        });
      });
    }
    return links;
  };

  page.at = xpath => this.doc.get(xpath);
  return Object.freeze(page);
};
