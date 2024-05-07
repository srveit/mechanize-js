import { newLink } from './link'

export function newMetaRefresh(node, page) {
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
    referrer: link.referrer,
    rel: link.rel,
    relIncludes: link.relIncludes,
    search: link.search,
    text: link.text,
    toString: link.toString,
    uri: link.uri,
  })
}
