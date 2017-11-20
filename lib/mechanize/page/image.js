'use strict';
const decode = require('unescape'),
  path = require('path'),
  URL = require('url'),
  {lookup} = require('mime-types');

exports.newImage = ({node, page}) => {
  const nodeAttr = (name) => {
      if (node && node.attr) {
        return node.attr(name) && node.attr(name).value();
      } else if (node) {
        return node[name];
      }
      return undefined;
    },

    agent = page.agent,
    alt = nodeAttr('alt'),
    caption = nodeAttr('rel'),
    domClass = nodeAttr('class'),
    domId = nodeAttr('id'),
    height = nodeAttr('height'),
    isHttp = page.isHttp,
    isHttps = page.isHttps,
    isRelative = !src.match(/^https?:\/\//),
    mimeType = lookup(src),
    src = nodeAttr('src'),
    extname = src && path.extname(src),
    title = nodeAttr('title'),
    url = isRelative ?
          (page.bases[0] ?
           page.bases[0].href + src :
           page.uri + encodeURIComponent(src)) :
        encodeURIComponent(src),
    width = nodeAttr('width'),
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
