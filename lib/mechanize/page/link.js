import { nodeAttr, search, textContent } from '../utils.js'

// eslint-disable object-curly-newline
export function newLink(node, page) {
  const agent = page.agent
  const link = {}
  const href = nodeAttr(node, 'href')
  const relVal = nodeAttr(node, 'rel')
  const rel = relVal ? relVal.toLowerCase().split(' ') : []
  const uri = page.resolveUrl(href)

  const relIncludes = (kind) => rel.includes(kind)

  const click = () => agent.click(link)

  const text = () =>
    textContent(node) ||
    search(node, '//img')
      .map((node) => nodeAttr(node, 'alt'))
      .join('')

  const getPage = (options) =>
    agent.get(
      Object.assign(
        {
          uri,
        },
        options
      )
    )

  Object.assign(link, {
    attributes: node,
    click,
    domClass: nodeAttr(node, 'class'),
    domId: nodeAttr(node, 'id'),
    getPage,
    href,
    node,
    page,
    referrer: page,
    rel,
    relIncludes,
    search: (xpath) => (node && search(node, xpath)) || [],
    text,
    toString: text,
    uri,
  })

  return Object.freeze(link)
}
