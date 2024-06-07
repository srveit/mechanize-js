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
import fetch, { FetchError, isRedirect } from 'node-fetch'
import * as querystring from 'querystring'

export function newAgent() {
  let logDir
  let userAgent = USER_AGENTS.Mechanize

  const agent = {}
  const history = newHistory()
  const cookieJar = new CookieJar(null, {
    rejectPublicSuffixes: false,
  })
  const isDomainOrSubdomain = (destination, original) => {
    const orig = new URL(original).hostname
    const dest = new URL(destination).hostname

    return orig === dest || orig.endsWith(`.${dest}`)
  }

  const isSameProtocol = (destination, original) => {
    const orig = new URL(original).protocol
    const dest = new URL(destination).protocol

    return orig === dest
  }
  const setCookie = cookieJar.setCookie.bind(cookieJar)

  const addResponseCookie = async ({ cookieString, url }) => {
    const cookie = Cookie.parse(cookieString)
    if (cookie === undefined) {
      return
    }
    await setCookie(cookie, url)
  }

  const addResponseCookies = async ({ response, url, page = undefined }) => {
    const metas = page
      ? page.search('//head/meta[@http-equiv="Set-Cookie"]')
      : []

    const cookieStrings = metas
      .map((meta) => nodeAttr(meta, 'content'))
      .concat(response.headers.raw()['set-cookie'])
      .filter((cookieString) => cookieString)

    for (const cookieString of cookieStrings) {
      await addResponseCookie({
        cookieString,
        url,
      })
    }
  }

  const getCookies = ({ domain, path = '/', secure = true }) => {
    const protocol = secure ? 'https' : 'http'
    return cookieJar.getCookies(`${protocol}://${domain}${path}`, {
      sort: true,
    })
  }

  const getCookieString = async (url) => {
    const cookies = await cookieJar.getCookies(url, {
      sort: true,
    })
    return cookies.map((cookie) => cookie.cookieString()).join('; ')
  }

  const getCookiesForUrl = (url) =>
    cookieJar.getCookies(url, {
      sort: true,
    })

  const getRequestHeaders = async (url, referrer, options) => {
    const headers = {
      'User-Agent': userAgent,
      Accept: '*/*',
      connection: 'keep-alive',
      Referer: referrer,
    }

    Object.assign(headers, options.headers)

    const cookieString = await getCookieString(url)
    if (cookieString) {
      headers.cookie = cookieString
    }
    return headers
  }

  const encodeBody = (options) => options.body

  const getRequestOptions = async (url, referrer, options) => {
    const headers = await getRequestHeaders(url, referrer, options)
    return {
      agent: null,
      body: encodeBody(options),
      compress: options.compress,
      counter: options.counter || 0,
      follow: options.follow || 20,
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

  async function decodeResponseBody(responseBlob, encoding, fixCharset) {
    if (responseBlob.type.match(/^(image|audio|video|font)\//)) {
      const arrayBuffer = await responseBlob.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }
    const responseBody1 = await responseBlob.text()
    let responseBody =
      encoding === null ? decodeResponseBody1(responseBody1) : responseBody1
    if (fixCharset) {
      responseBody = responseBody.replace('charset=utf-16le', 'utf-8')
      if (responseBody.match(/charset=windows-1252/)) {
        responseBody = decode(responseBody)
      }
    }

    if (responseBlob.type.startsWith('application/json')) {
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

  const getUrl = (uri, referrer, params = {}) => {
    const baseUrl = history.currentPage()?.uri || referrer
    const url = new URL(getResolvedUri(uri, baseUrl))
    for (const [string, value] of Object.entries(params)) {
      url.searchParams.set(string, value)
    }
    return url.toString()
  }

  const deleteHeader = (headers, headerName) => {
    const propertyName = Object.getOwnPropertyNames(headers).find(
      (name) => name.toLowerCase() == headerName.toLowerCase()
    )
    if (propertyName) {
      delete headers[propertyName]
    }
  }

  const fetchPage = async (urlOrPath, options = {}) => {
    const referrer = getReferrer(options?.headers?.Referer)
    const url = getUrl(urlOrPath, referrer, options.params)
    const reqOptions = await getRequestOptions(url, referrer, options)
    let followRedirect
    if (!reqOptions.redirect || reqOptions.redirect === 'follow') {
      followRedirect = true
      reqOptions.redirect = 'manual'
    }
    if (options.debug) {
      console.log('fetchPage', url, reqOptions)
    }
    const response = await fetch(url, reqOptions)
    if (options.debug) {
      console.log('  response', response.status, response.headers)
    }
    await addResponseCookies({ response, url })
    const location = response.headers.get('location')

    if (followRedirect && isRedirect(response.status) && location !== null) {
      let locationURL = null
      try {
        locationURL = new URL(location, url)
      } catch {
        throw new FetchError(
          `uri requested responds with an invalid redirect URL: ${location}`,
          'invalid-redirect'
        )
      }
      if (reqOptions.counter >= reqOptions.follow) {
        throw new FetchError(
          `maximum redirect reached at: ${url}`,
          'max-redirect'
        )
      }
      const headers = Object.assign({}, reqOptions.headers)

      headers.Referer = new URL(headers.Referer).origin + '/'
      const requestOptions = {
        follow: reqOptions.follow,
        counter: reqOptions.counter + 1,
        agent: reqOptions.agent,
        compress: reqOptions.compress,
        method: reqOptions.method,
        // body: clone(reqOptions.body),
        redirect: 'follow',
        signal: reqOptions.signal,
        size: reqOptions.size,
        referrerPolicy: reqOptions.referrerPolicy,
        debug: options.debug,
      }
      if (
        !isDomainOrSubdomain(url, locationURL) ||
        !isSameProtocol(url, locationURL)
      ) {
        for (const name of [
          'authorization',
          'www-authenticate',
          'cookie',
          'cookie2',
        ]) {
          deleteHeader(headers, name)
        }
      }
      if (
        response.status === 303 ||
        ((response.status === 301 || response.status === 302) &&
          reqOptions.method.toUpperCase() === 'POST')
      ) {
        requestOptions.method = 'GET'
        requestOptions.body = undefined
        deleteHeader(headers, 'content-length')
      }
      if (headers['Sec-Fetch-Site'] === 'same-origin') {
        headers['Sec-Fetch-Site'] = 'same-site'
      }
      requestOptions.headers = headers
      return await fetchPage(locationURL.toString(), requestOptions)
    }

    let responseBody = await decodeResponseBody(
      await response.blob(),
      options.encoding,
      options.fixCharset
    )

    const page = newPage({
      uri: url,
      response,
      body: responseBody,
      agent,
    })

    await addResponseCookies({
      response,
      url,
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

  const submit = ({ form, button, headers, redirect, debug = false }) => {
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
    if (method && method.toUpperCase() === 'POST') {
      if (contentType === 'multipart/form-data') {
        contentType += '; boundary=' + form.boundary
      }
      body = form.requestData(enctype)
      if (debug) {
        console.log('submit', enctype, body)
      }
      requestHeaders = {
        'Content-Type': contentType,
        'Content-Length': body.length.toString(),
        Referer: new URL(form.page.uri).origin + '/',
        'Cache-Control': 'no-cache',
        Origin: new URL(form.page.uri).origin,
        Pragma: 'no-cache',
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
      debug,
    })
  }

  const setUserAgent = (agentAlias) => {
    userAgent = USER_AGENTS[agentAlias]
  }

  Object.assign(agent, {
    get: fetchPage,
    getCookies,
    getCookiesForUrl,
    getCookieString,
    setCookie,
    setLogDir,
    setUserAgent,
    submit,
    userAgent: () => userAgent,
  })

  return Object.freeze(agent)
}
