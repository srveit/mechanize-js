import { writeFile } from 'fs/promises'
import { URL } from 'url'
import { Cookie, CookieJar } from 'tough-cookie'
import { newHistory } from './history.js'
import { newPage } from './page.js'
import { USER_AGENTS } from './constants.js'
import { nodeAttr } from './utils.js'
import { encode, decode, labels } from 'windows-1252'
import * as mime from 'mime'
import * as path from 'path'
import fetch from 'node-fetch'
import * as querystring from 'querystring'

export function newAgent() {
  let logDir
  let userAgent = USER_AGENTS.Mechanize

  const agent = {}
  const history = newHistory()
  const cookieJar = new CookieJar(null, {
    rejectPublicSuffixes: false,
  })

  const addResponseCookie = async ({ cookieString, uri }) => {
    const cookie = Cookie.parse(cookieString)
    await setCookie(cookie, uri.toString())
  }

  const addResponseCookies = async ({ response, uri, page }) => {
    const metas = page.search('//head/meta[@http-equiv="Set-Cookie"]')

    const cookieStrings = metas
      .map((meta) => nodeAttr(meta, 'content'))
      .concat(response.headers.raw()['set-cookie'])
      .filter((cookieString) => cookieString)

    for (const cookieString of cookieStrings) {
      await addResponseCookie({
        cookieString,
        uri,
      })
    }
  }

  const getCookieString = async (uri) => {
    const getCookiesP = cookieJar.getCookies.bind(cookieJar)
    const cookies = await getCookiesP(uri)
    const cookieStrs = cookies && cookies.map((cookie) => cookie.cookieString())

    return cookieStrs && cookieStrs.join('; ')
  }

  const getRequestHeaders = async (uri, referrer, options) => {
    const headers = {
      'User-Agent': userAgent,
      Accept: '*/*',
      connection: 'keep-alive',
      Referer: referrer,
    }

    Object.assign(headers, options.headers)

    if (!headers.Origin && referrer) {
      const parsedURI = new URL(referrer)
      headers.Origin = parsedURI.protocol + '//' + parsedURI.host
    }

    const cookieString = await getCookieString(uri)
    if (cookieString) {
      headers.cookie = cookieString
    }
    return headers
  }

  const encodeBody = (options) => options.body

  const getRequestOptions = async (uri, referrer, options) => {
    const headers = await getRequestHeaders(uri, referrer, options)
    return {
      agent: null,
      body: encodeBody(options),
      compress: options.compress,
      counter: options.counter,
      follow: options.follow,
      headers,
      highWaterMark: options.highWaterMark,
      insecureHTTPParser: options.insecureHTTPParser,
      method: (options.method && options.method.toUpperCase()) || 'GET',
      priority: options.priority,
      redirect: options.redirect,
      referrer: headers.Referer,
      referrerPolicy: options.referrerPolicy,
      signal: options.signal,
      size: options.size,
    }
  }

  const logPage = async ({ body, url, response }) => {
    const contentType = response.headers.raw()['content-type']
    const ext = mime.extension(
      contentType && contentType.split(/[ \t]*;[ \t]*/)[0]
    )
    const timestamp = new Date().toISOString().replaceAll(/[-T:.Z]/g, '')
    const filename =
      path.join(
        logDir,
        timestamp + '_' + path.basename(url, path.extname(url))
      ) + (ext ? '.' + ext : '')
    const encoding = 'utf8'

    await writeFile(filename, body, {
      encoding,
    })
    return filename
  }

  function decodeResponseBody1(responseBody) {
    const body = responseBody
    if (body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf) {
      // encoded UTF-8
      const body2 = Buffer.allocUnsafe(body.length - 3)
      body.copy(body2, 0, 3)
      return body2.toString('utf8')
    }
    if (body[0] === 0xfe && body[1] === 0xff) {
      // encoded UTF-16 big-endian
      body.swap16()
      const body2 = Buffer.allocUnsafe(body.length - 2)
      body.copy(body2, 0, 2)
      return body2.toString('utf16le')
    }
    if (body[0] === 0xff && body[1] === 0xfe) {
      // encoded UTF-16 little-endian
      const body2 = Buffer.allocUnsafe(body.length - 2)
      body.copy(body2, 0, 2)
      return body2.toString('utf16le')
    }
    // encoded UTF-8
    return body.toString('binary')
  }

  function decodeResponseBody(
    responseBody1,
    encoding,
    fixCharset,
    contentType
  ) {
    let responseBody =
      encoding === null ? decodeResponseBody1(responseBody1) : responseBody1
    if (fixCharset) {
      responseBody = responseBody.replace('charset=utf-16le', 'utf-8')
      if (responseBody.match(/charset=windows-1252/)) {
        responseBody = decode(responseBody)
      }
    }

    if (contentType.startsWith('application/json')) {
      try {
        responseBody = JSON.parse(responseBody)
      } catch (e) {
        // console.warn(`error parsing ${responseBody}`, e)
      }
    }
    return responseBody
  }

  const getReferrer = (headerReferrer) => {
    if (headerReferrer) {
      return headerReferrer
    }
    if (history.currentPage()) {
      return history.currentPage().uri
    }
  }

  const getResolvedUri = (uri, referrer) => {
    if (uri.startsWith('http')) {
      return uri
    }
    return new URL(uri, referrer).toString()
  }

  const getUri = (uri, referrer, params = {}) => {
    const url = new URL(getResolvedUri(uri, referrer))
    for (const [string, value] of Object.entries(params)) {
      url.searchParams.set(string, value)
    }
    return url.toString()
  }

  const fetchPage = async (uri, options = {}) => {
    const referrer = getReferrer(options?.headers?.Referer)
    const url = getUri(uri, referrer, options.params)
    const reqOptions = await getRequestOptions(url, referrer, options)
    const response = await fetch(url, reqOptions)

    let responseBody = decodeResponseBody(
      await response.text(),
      options.encoding,
      options.fixCharset,
      response.headers.get('content-type') || ''
    )

    const page = newPage({
      uri: url,
      response,
      body: responseBody,
      agent,
    })

    await addResponseCookies({
      response,
      uri: new URL(url),
      page,
    })
    history.push(page)
    if (logDir) {
      await logPage({
        body: responseBody,
        url,
        response,
      })
    }
    return page
  }

  const setLogDir = (dir) => {
    logDir = dir
  }

  const submit = ({ form, button, headers, redirect }) => {
    const action = (button && button.action) || (form && form.action) || ''
    const enctype = (button && button.enctype) || (form && form.enctype)
    const method = (button && button.method) || (form && form.method) || 'get'
    let params
    let body
    let uri =
      (action && querystring.unescape(action)) || (form.page && form.page.uri)
    let contentType = enctype
    let requestHeaders = {}
    if (button) {
      form.addButtonToQuery(button)
    }
    if (method && method.toLowerCase() === 'post') {
      if (contentType === 'multipart/form-data') {
        contentType += '; boundary=' + form.boundary
      }
      body = form.requestData(enctype)
      requestHeaders = {
        'Content-Type': contentType,
        'Content-Length': body.length.toString(),
        Referer: form.page.uri,
      }
    } else {
      uri = uri.replace(/\?[!#$&-;=?-[\]_a-z~]*$/, '')
      params = form.buildQuery()
    }

    return fetchPage(uri, {
      body,
      headers: Object.assign(requestHeaders, headers),
      method,
      redirect,
      params,
    })
  }

  const setUserAgent = (agentAlias) => {
    userAgent = USER_AGENTS[agentAlias]
  }

  const getCookies = async ({ domain, path = '/', secure = true }) => {
    const protocol = secure ? 'https' : 'http'
    const currentUrl = `${protocol}://${domain}${path}`
    return await cookieJar.getCookies(currentUrl)
  }

  const setCookie = cookieJar.setCookie.bind(cookieJar)

  Object.assign(agent, {
    get: fetchPage,
    getCookies,
    getCookieString,
    setCookie,
    setLogDir,
    setUserAgent,
    submit,
    userAgent: () => userAgent,
  })

  return Object.freeze(agent)
}
