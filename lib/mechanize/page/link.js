'use strict';
const {nodeAttr, search, textContent} = require('../utils.js');

// eslint-disable object-curly-newline
exports.newLink = (node, page) => {
  const agent = page.agent,
    link = {},
    href = nodeAttr(node, 'href'),
    relVal = nodeAttr(node, 'rel'),
    rel = relVal ?
      relVal.toLowerCase().split(' ') :
      [],
    uri = page.resolveUrl(href),

    relIncludes = kind => rel.includes(kind),

    click = () => agent.click(link),

    text = () => textContent(node) || search(node, '//img')
      .map(node => nodeAttr(node, 'alt'))
      .join(''),

    getPage = options => agent.get(Object.assign(
      {
        uri
      },
      options
    ));

  Object.assign(link, {
    attributes: node,
    click,
    domClass: nodeAttr(node, 'class'),
    domId: nodeAttr(node, 'id'),
    getPage,
    href,
    node,
    page,
    referer: page,
    rel,
    relIncludes,
    search: xpath => (node && search(node, xpath)) || [],
    text,
    toString: text,
    uri
  });

  return Object.freeze(link);
};
