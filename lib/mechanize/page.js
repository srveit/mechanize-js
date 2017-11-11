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

    at = xpath => this.doc.get(xpath),

    form = function (name) {
      const forms = doc.find('//form'),
        element = forms[name] || forms.find(element =>
          (element.attr('id') && element.attr('id').value() === name) ||
          (element.attr('name') && element.attr('name').value() === name));

      return element && new Form(page, forms[name]);
    },

    labelFor = id => labels[id],

    links = () => ['a', 'area'].reduce(
      (allLinks, tag) => allLinks.concat(doc.find('//' + tag)).reduce(
        (links, node) => links.concat(newLink(node)),
        []
      ),
      []
    ),

    responseHeaderCharset = () => Object.entries(response.headers || {}).reduce(
      (charsets, [name, value]) => {
        const m = value && /charset=([-().:_0-9a-zA-z]+)/.exec(value);
        return m ? charsets.concat(m[1]) : charsets;
      },
      []
    ),

    search = (xpath) => doc && doc.root() ? doc.find(xpath) : [],

    statusCode = () => response && response.statusCode,

    submit = (form, button, headers, requestOptions) =>
      agent.submit(form, button, headers, requestOptions),

    title = () => {
      const node = this.doc.get('//title');
      return node && node.text();
    };

  return Object.freeze({
    at,
    form,
    labelFor,
    links,
    responseHeaderCharset,
    search,
    statusCode,
    submit,
    title
  });
};
