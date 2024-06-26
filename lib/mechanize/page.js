import { URL } from 'url'
import { newForm } from './form.js'
import { newLink } from './page/link.js'
import { at, nodeAttr, parseHtmlString, search, textContent } from './utils.js'

export function newPage({ uri, response, body, agent }) {
  const page = {}
  const doc = parseHtmlString(body)

  // eslint-disable-next-line
  // TODO: initialize
  const labels = {}

  const form = (name) => {
    const forms = search(doc, '//form')
    const element =
      forms[name] ||
      forms.find(
        (node) =>
          nodeAttr(node, 'id') === name || nodeAttr(node, 'name') === name
      )

    return element && newForm(page, element)
  }

  // eslint-disable-next-line
  // TODO: implement
  const isHttp = 1

  // eslint-disable-next-line
  // TODO: implement
  const isHttps = 1

  const labelFor = (id) => labels[id]

  const links = () =>
    ['a', 'area'].reduce(
      (allLinks, tag) =>
        allLinks.concat(
          search(doc, '//' + tag).reduce(
            (links, node) => links.concat(newLink(node, page)),
            []
          )
        ),
      []
    )

  const resolveUrl = (url) => new URL(url, page.uri).toString()

  const responseHeaderCharset = () =>
    Object.entries(response.headers || {}).reduce((charsets, [name, value]) => {
      // eslint-disable-line no-unused-vars
      const m = value && /charset=([-().:_0-9a-zA-z]+)/.exec(value)
      return m ? charsets.concat(m[1]) : charsets
    }, [])

  const statusCode = () => response && response.statusCode

  const submit = ({ form, button, headers, requestOptions }) =>
    agent.submit({
      form,
      button,
      headers,
      redirect: requestOptions && requestOptions.redirect,
    })

  const title = () => {
    const node = at(doc, '//title')
    return textContent(node)
  }

  const userAgent = agent && agent.userAgent

  const userAgentVersion = agent && agent.userAgentVersion

  Object.assign(page, {
    agent,
    at: (xpathExpression) => at(doc, xpathExpression),
    body,
    doc,
    form,
    isHttp,
    isHttps,
    labelFor,
    links,
    resolveUrl,
    responseHeaders: response && response.headers,
    responseHeaderCharset,
    search: (xpathExpression) => search(doc, xpathExpression),
    statusCode,
    submit,
    title,
    uri,
    userAgent,
    userAgentVersion,
  })

  return Object.freeze(page)
}
