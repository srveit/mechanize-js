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

  const getRequestHeaders = async (uri, options) => {
    const headers = {
      'User-Agent': userAgent,
      Accept: '*/*',
      connection: 'keep-alive',
    }
    const referrer =
      options.referrer ||
      history.currentPage() ||
      newPage({
        response: {
          'content-type': 'text/html',
        },
        agent,
      })

    Object.assign(headers, options.headers)

    let referrerURI
    if (typeof referrer === 'string') {
      referrerURI = referrer
    } else if (referrer) {
      referrerURI = referrer.uri
    }

    if (referrerURI) {
      const parsedURI = new URL(referrerURI)

      headers.Referer = referrerURI
      headers.Origin = parsedURI.protocol + '//' + parsedURI.host
    }
    const currentUri = new URL(uri, referrerURI).toString()
    const cookieString = await getCookieString(currentUri)
    if (cookieString) {
      headers.cookie = cookieString
    }
    return headers
  }

  const encodeBody = (options) => options.body

  const getRequestOptions = async (uri, options) => {
    const headers = await getRequestHeaders(uri, options)
    return {
      body: encodeBody(options),
      headers,
      // agent, TODO
      // cache - not implemented
      // credentials - not implemented
      compress: options.compress,
      counter: options.counter,
      // destination - not implemented
      follow: options.follow,
      highWaterMark: options.highWaterMark,
      // integrity - not implemented
      // keepalive - not implemented
      method:
        (options.method && options.method.toUpperCase()) ||
        (options.verb && options.verb.toUpperCase()) ||
        'GET',
      // mode - not implemented
      priority: options.priority,
      redirect: options.redirect,
      referrer: headers.Referer,
      referrerPolicy: options.referrerPolicy,
      signal: options.signal,
      // type - not implemented
    }
  }

  const logPage = async ({ body, uri, response }) => {
    const contentType = response.headers.raw()['content-type']
    const ext = mime.extension(
      contentType && contentType.split(/[ \t]*;[ \t]*/)[0]
    )
    const timestamp = new Date().toISOString().replaceAll(/[-T:.Z]/g, '')
    const filename =
      path.join(
        logDir,
        timestamp + '_' + path.basename(uri, path.extname(uri))
      ) + (ext ? '.' + ext : '')
    const encoding = 'utf8'

    await writeFile(filename, body, {
      encoding,
    })
    return filename
  }

  // TODO rename uri1
  const fetchPage = async (uri, options = {}) => {
    const reqOptions = await getRequestOptions(uri, options)
    const uri1 = reqOptions.headers.Referer
      ? new URL(uri, reqOptions.headers.Referer)
      : uri
    const response = await fetch(uri1, reqOptions)

    let responseBody = await response.text()

    if (reqOptions.encoding === null) {
      const body = responseBody
      if (body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf) {
        // encoded UTF-8
        const body2 = Buffer.allocUnsafe(body.length - 3)
        body.copy(body2, 0, 3)
        responseBody = body2.toString('utf8')
      } else if (body[0] === 0xfe && body[1] === 0xff) {
        // encoded UTF-16 big-endian
        body.swap16()
        const body2 = Buffer.allocUnsafe(body.length - 2)
        body.copy(body2, 0, 2)
        responseBody = body2.toString('utf16le')
      } else if (body[0] === 0xff && body[1] === 0xfe) {
        // encoded UTF-16 little-endian
        const body2 = Buffer.allocUnsafe(body.length - 2)
        body.copy(body2, 0, 2)
        responseBody = body2.toString('utf16le')
      } else {
        // encoded UTF-8
        responseBody = body.toString('binary')
      }
    }
    if (options.fixCharset) {
      responseBody = responseBody.replace('charset=utf-16le', 'utf-8')
      if (responseBody.match(/charset=windows-1252/)) {
        responseBody = decode(responseBody)
      }
    }

    if (
      (response.headers.get('content-type') || '').startsWith(
        'application/json'
      )
    ) {
      try {
        responseBody = JSON.parse(responseBody)
      } catch (e) {
        // console.warn(`error parsing ${responseBody}`, e)
      }
    }

    const page = newPage({
      uri,
      response,
      body: responseBody,
      agent,
    })

    await addResponseCookies({
      response,
      uri: new URL(uri),
      page,
    })
    history.push(page)
    if (logDir) {
      await logPage({
        body: responseBody,
        uri,
        response,
      })
    }
    return page
  }

  const setLogDir = (dir) => {
    logDir = dir
  }

  // TODO change verb to method
  // TODO change followAllRedirects to redirect
  // TODO change params to add query string to URL
  const submit = ({ form, button, headers, followAllRedirects }) => {
    const action = (button && button.action) || (form && form.action) || ''
    const enctype = (button && button.enctype) || (form && form.enctype)
    const method = (button && button.method) || (form && form.method)
    let verb
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
      verb = 'post'
      body = form.requestData(enctype)
      requestHeaders = {
        'Content-Type': contentType,
        'Content-Length': body.length.toString(),
      }
    } else {
      verb = 'get'
      uri = uri.replace(/\?[!#$&-;=?-[\]_a-z~]*$/, '')
      params = form.buildQuery()
    }

    if (!uri.startsWith('http')) {
      uri = new URL(uri, form.page.uri).toString()
    }
    return fetchPage(uri, {
      body,
      headers: Object.assign(requestHeaders, headers),
      verb,
      referrer: form.page,
      followAllRedirects,
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
