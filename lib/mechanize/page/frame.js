'use strict'
import { newLink } from './link'

exports.newFrame = (node, page) => {
  const link = newLink(node, page)
  // eslint-disable-next-line no-warning-comments, capitalized-comments
  // TODO: implement
  return Object.freeze({
    attributes: link.attributes,
    domClass: link.domClass,
    domId: link.domId,
    href: link.href,
    node: link.node,
    page: link.page,
    referer: link.referer,
    rel: link.rel,
    relIncludes: link.relIncludes,
    search: link.search,
    text: link.text,
    toString: link.toString,
    uri: link.uri,
  })
}
