'use strict';
const libxml = require('libxmljs'),
  {URL} = require('url'),
  {newForm} = require('./form'),
  {newLink} = require('./page/link');

const parseHtmlString = body => {
  let doc;
  try {
    doc = libxml.parseHtmlString(body);
  } catch (error) {
    console.log(error);
  }
  return doc;
};

exports.newPage = ({uri, response, body, code, agent}) => {
  const doc = parseHtmlString(body),
    labels = {},  // TODO: initialize

    search = xpath => doc && doc.root() ? doc.find(xpath) : [],

    at = xpath => doc && doc.root() ? doc.get(xpath) : undefined,

    form = name => {
      const forms = search('//form'),
        element = forms[name] || forms.find(element =>
          (element.attr('id') && element.attr('id').value() === name) ||
          (element.attr('name') && element.attr('name').value() === name));

      return element && newForm({page, node: element});
    },

    isHttp = 1, // TODO: implement
    isHttps = 1, // TODO: implement

    labelFor = id => labels[id],

    links = () => ['a', 'area'].reduce(
      (allLinks, tag) => allLinks.concat(search('//' + tag).reduce(
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

    submit = ({form, button, headers, requestOptions}) =>
      agent.submit({form, button, headers, requestOptions}),

    title = () => {
      const node = at('//title');
      return node && node.text();
    },

    userAgent = agent && agent.userAgent,

    userAgentVersion = agent && agent.userAgentVersion,

    page = {
      agent,
      at,
      body,
      code,
      doc,
      form,
      isHttp,
      isHttps,
      labelFor,
      links,
      resolveUrl,
      responseHeaderCharset,
      search,
      statusCode,
      submit,
      title,
      uri: uri || 'local:/',
      userAgent,
      userAgentVersion
    };

  return Object.freeze(page);
};
