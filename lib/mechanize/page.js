'use strict';
const libxml = require('libxmljs'),
  {newForm} = require('./form'),
  {newLink} = require('./page/link');

exports.newPage = ({uri, response, body, code, agent}) => {
  const doc = body && libxml.parseHtmlString(body),
    labels = {},  // TODO: initialize

    at = xpath => doc.get(xpath),

    form = name => {
      const forms = doc.find('//form'),
        element = forms[name] || forms.find(element =>
          (element.attr('id') && element.attr('id').value() === name) ||
          (element.attr('name') && element.attr('name').value() === name));

      return element && newForm({page, node: element});
    },

    labelFor = id => labels[id],

    links = () => ['a', 'area'].reduce(
      (allLinks, tag) => allLinks.concat(doc.find('//' + tag).reduce(
        (links, node) => links.concat(newLink(node)),
        []
      )),
      []
    ),

    responseHeaderCharset = () => Object.entries(response.headers || {}).reduce(
      (charsets, [name, value]) => { // eslint-disable-line no-unused-vars
        const m = value && /charset=([-().:_0-9a-zA-z]+)/.exec(value);
        return m ? charsets.concat(m[1]) : charsets;
      },
      []
    ),

    search = (xpath) => doc && doc.root() ? doc.find(xpath) : [],

    statusCode = () => response && response.statusCode,

    submit = ({form, button, headers, requestOptions}) =>
      agent.submit({form, button, headers, requestOptions}),

    title = () => {
      const node = doc.get('//title');
      return node && node.text();
    },

    userAgent = agent && agent.userAgent,

    userAgentVersion = agent && agent.userAgentVersion,

    page = {
      at,
      body,
      code,
      doc,
      form,
      labelFor,
      links,
      responseHeaderCharset,
      search,
      statusCode,
      submit,
      title,
      uri,
      userAgent,
      userAgentVersion
    };

  return Object.freeze(page);
};
