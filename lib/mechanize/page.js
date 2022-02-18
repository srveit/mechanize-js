'use strict';
const {URL} = require('url'),
  {newForm} = require('./form'),
  {newLink} = require('./page/link'),
  {at, nodeAttr, parseHtmlString, search, textContent} = require('./utils.js');


exports.newPage = ({uri, response, body, agent}) => {
  const doc = parseHtmlString(body),
    labels = {},  // TODO: initialize

    form = name => {
      const forms = search(doc, '//form'),
        element = forms[name] || forms.find(node =>
          nodeAttr({node, name: 'id'}) === name ||
            nodeAttr({node, name: 'name'}) === name
        );

      return element && newForm({page, node: element});
    },

    isHttp = 1, // TODO: implement
    isHttps = 1, // TODO: implement

    labelFor = id => labels[id],

    links = () => ['a', 'area'].reduce(
      (allLinks, tag) => allLinks.concat(search(doc, '//' + tag).reduce(
        (links, node) => links.concat(newLink({node, agent, page})),
        []
      )),
      []
    ),

    resolveUrl = url => new URL(url, page.uri).toString(),

    responseHeaderCharset = () => Object.entries(response.headers || {}).reduce(
      (charsets, [name, value]) => { // eslint-disable-line no-unused-vars
        const m = value && /charset=([-().:_0-9a-zA-z]+)/.exec(value);
        return m ? charsets.concat(m[1]) : charsets;
      },
      []
    ),

    statusCode = () => response && response.statusCode,

    submit = ({form, button, headers, requestOptions}) => {
      return agent.submit({
        form,
        button,
        headers,
        followAllRedirects: requestOptions && requestOptions.followAllRedirects
      });
    },

    title = () => {
      const node = at(doc, '//title');
      return textContent(node);
    },

    userAgent = agent && agent.userAgent,

    userAgentVersion = agent && agent.userAgentVersion,

    page = {
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
      userAgentVersion,
    };

  return Object.freeze(page);
};
