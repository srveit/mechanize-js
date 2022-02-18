'use strict';
const {URL} = require('url');
const {nodeAttr, search, textContent} = require('../utils.js')

exports.newLink = ({node, agent, page}) => {
  agent = agent || page.agent;
  const href = nodeAttr({node, name: 'href'}),

    relVal = nodeAttr({node, name: 'rel'}),

    rel = relVal ? relVal.toLowerCase().split(' ') : [],

    relIncludes = kind => rel.includes(kind),

    click = () => agent.click(link),

    attributes = {},

    text = () => textContent(node) || search(node, '//img')
      .map(node => nodeAttr({node, name: 'alt'}))
      .join(''),

    uri = page.resolveUrl(href),

    getPage = options => agent.get(Object.assign({uri}, options)),

    link = Object.freeze({
      attributes: node,
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
      uri,
    });

  return link;
};
