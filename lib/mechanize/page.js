'use strict'
const { URL } = require('url')
const { newForm } = require('./form')
const { newLink } = require('./page/link')
const { at, nodeAttr, parseHtmlString, search, textContent } = require('./utils.js')

exports.newPage = ({ uri, response, body, agent }) => {
  const page = {}
  const doc = parseHtmlString(body)

  // eslint-disable-next-line
    // TODO: initialize
  const labels = {}

  const form = name => {
    const forms = search(doc, '//form')
    const element = forms[name] || forms.find(node =>
      nodeAttr(node, 'id') === name ||
            nodeAttr(node, 'name') === name
    )

    return element && newForm(page, element)
  }

  // eslint-disable-next-line
    // TODO: implement
  const isHttp = 1

  // eslint-disable-next-line
    // TODO: implement
  const isHttps = 1

  const labelFor = id => labels[id]

  const links = () => ['a', 'area'].reduce(
    (allLinks, tag) => allLinks.concat(search(doc, '//' + tag).reduce(
      (links, node) => links.concat(newLink(node, page)),
      []
    )),
    []
  )

  const resolveUrl = url => new URL(url, page.uri).toString()

  const responseHeaderCharset = () => Object.entries(response.headers || {}).reduce(
    (charsets, [name, value]) => { // eslint-disable-line no-unused-vars
      const m = value && (/charset=([-().:_0-9a-zA-z]+)/).exec(value)
      return m
        ? charsets.concat(m[1])
        : charsets
    },
    []
  )

  const statusCode = () => response && response.statusCode

  const submit = ({ form, button, headers, requestOptions }) => agent.submit({
    form,
    button,
    headers,
    followAllRedirects: requestOptions && requestOptions.followAllRedirects,
  })

  const title = () => {
    const node = at(doc, '//title')
    return textContent(node)
  }

  const userAgent = agent && agent.userAgent

  const userAgentVersion = agent && agent.userAgentVersion

  Object.assign(page, {
    agent,
    at: xpathExpression => at(doc, xpathExpression),
    body,
    doc,
    form,
    isHttp,
    isHttps,
    labelFor,
    links,
    resolveUrl,
    responseHeaderCharset,
    search: xpathExpression => search(doc, xpathExpression),
    statusCode,
    submit,
    title,
    uri: uri || 'local:/',
    userAgent,
    userAgentVersion,
  })

  return Object.freeze(page)
}
