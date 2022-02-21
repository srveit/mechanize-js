'use strict';
const {URL} = require('url'),
  {newForm} = require('./form'),
  {newLink} = require('./page/link'),
  {at, nodeAttr, parseHtmlString, search, textContent} = require('./utils.js');

exports.newPage = ({uri, response, body, agent}) => {
  const page = {},
    doc = parseHtmlString(body),

    // eslint-disable-next-line
    // TODO: initialize
    labels = {},

    form = name => {
      const forms = search(doc, '//form'),
        element = forms[name] || forms.find(node =>
          nodeAttr(node, 'id') === name ||
            nodeAttr(node, 'name') === name
        );

      return element && newForm(page, element);
    },

    // eslint-disable-next-line
    // TODO: implement
    isHttp = 1,

    // eslint-disable-next-line
    // TODO: implement
    isHttps = 1,

    labelFor = id => labels[id],

    links = () => ['a', 'area'].reduce(
      (allLinks, tag) => allLinks.concat(search(doc, '//' + tag).reduce(
        (links, node) => links.concat(newLink(node, page)),
        []
      )),
      []
    ),

    resolveUrl = url => new URL(url, page.uri).toString(),

    responseHeaderCharset = () => Object.entries(response.headers || {}).reduce(
      (charsets, [name, value]) => { // eslint-disable-line no-unused-vars
        const m = value && (/charset=([-().:_0-9a-zA-z]+)/).exec(value);
        return m ?
          charsets.concat(m[1]) :
          charsets;
      },
      []
    ),

    statusCode = () => response && response.statusCode,

    submit = ({form, button, headers, requestOptions}) => agent.submit({
      form,
      button,
      headers,
      followAllRedirects: requestOptions && requestOptions.followAllRedirects
    }),

    title = () => {
      const node = at(doc, '//title');
      return textContent(node);
    },

    userAgent = agent && agent.userAgent,

    userAgentVersion = agent && agent.userAgentVersion;

  Object.assign(page, {
    agent,
    at: xpathExpression => at(doc, xpathExpression),
    body,
    doc,
    form,
    isHttp,
    isHttps,
    labelFor,
    links,
    resolveUrl,
    responseHeaderCharset,
    search: xpathExpression => search(doc, xpathExpression),
    statusCode,
    submit,
    title,
    uri: uri || 'local:/',
    userAgent,
    userAgentVersion
  });

  return Object.freeze(page);
};
