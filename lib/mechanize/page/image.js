'use strict';
const path = require('path'),
  {nodeAttr} = require('../utils.js');

exports.newImage = ({node, page}) => {
  const getAttribute = (name) => nodeAttr(node, name),

    agent = page.agent,
    alt = getAttribute('alt'),
    caption = getAttribute('rel'),
    domClass = getAttribute('class'),
    domId = getAttribute('id'),
    height = getAttribute('height'),
    src = getAttribute('src'),
    isRelative = !src.match(/^https?:\/\//),
    extname = src && path.extname(src),
    title = getAttribute('title'),
    // eslint-disable-next-line
    url = isRelative ?
      page.bases[0] ?
        page.bases[0].href + src :
        page.uri + encodeURIComponent(src) :
      encodeURIComponent(src),
    width = getAttribute('width'),
    imageReferer = 1,

    fetch = ({params, referer, headers}) => agent.get({
      uri: src,
      params,
      referer: referer || imageReferer,
      headers
    });

  return Object.freeze({
    agent,
    alt,
    caption,
    domClass,
    domId,
    extname,
    fetch,
    height,
    imageReferer,
    isRelative,
    node,
    page,
    src,
    text: caption,
    title,
    uri: url,
    url,
    width
  });
};
