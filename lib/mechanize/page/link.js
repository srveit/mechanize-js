'use strict';
const {nodeAttr, search, textContent} = require('../utils.js');

// eslint-disable object-curly-newline
exports.newLink = ({node, agent, page}) => {
  agent = agent || page.agent;
  const href = nodeAttr({node, name: 'href'}),

    relVal = nodeAttr({node, name: 'rel'}),

    rel = relVal ?
      relVal.toLowerCase().split(' ') :
      [],

    relIncludes = kind => rel.includes(kind),

    click = () => agent.click(link),

    text = () => textContent(node) || search(node, '//img')
      .map(node => nodeAttr({node, name: 'alt'}))
      .join(''),

    uri = page.resolveUrl(href),

    getPage = options => agent.get(Object.assign({uri}, options)),

    link = Object.freeze({
      attributes: node,
      click,
      domClass: nodeAttr({node, name: 'class'}),
      domId: nodeAttr({node, name: 'id'}),
      getPage,
      href,
      node,
      page,
      referer: page,
      rel,
      relIncludes,
      search: xpath => node ? search(node, xpath) : [],
      text,
      toString: text,
      uri
    });

  return link;
};
