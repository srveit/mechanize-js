import * as path from 'path'
import { nodeAttr } from '../utils.js'

export function newImage({ node, page }) {
  const getAttribute = (name) => nodeAttr(node, name)

  const agent = page.agent
  const alt = getAttribute('alt')
  const caption = getAttribute('rel')
  const domClass = getAttribute('class')
  const domId = getAttribute('id')
  const height = getAttribute('height')
  const src = getAttribute('src')
  const isRelative = !src.match(/^https?:\/\//)
  const extname = src && path.extname(src)
  const title = getAttribute('title')
  // eslint-disable-next-line
  const url = isRelative
    ? page.bases[0]
      ? page.bases[0].href + src
      : page.uri + encodeURIComponent(src)
    : encodeURIComponent(src)
  const width = getAttribute('width')
  const imageReferer = 1

  const fetch = ({ params, referer, headers }) =>
    agent.get({
      uri: src,
      params,
      referer: referer || imageReferer,
      headers,
    })

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
    width,
  })
}
