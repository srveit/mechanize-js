'use strict'

const { writeFile } = require('fs/promises')
const { promisify } = require('util')
const windows1252 = require('windows-1252')
const mime = require('mime')
const path = require('path')
const { URL } = require('url')
const { CookieJar } = require('tough-cookie')
const fetch = require('node-fetch')
const querystring = require('querystring')
const { newHistory } = require('./history')
const { newPage } = require('./page')
const { USER_AGENTS } = require('./constants')
const { nodeAttr } = require('./utils.js')

const newAgent = () => {
  let logDir
  let userAgent = USER_AGENTS.Mechanize

  const agent = {}
  const history = newHistory()
  const cookieJar = new CookieJar(
    null,
    {
      rejectPublicSuffixes: false,
    }
  )

  const addResponseCookie = async ({ cookieString, uri }) => {
    const cookieStringSplitter = /[:](?=\s*[a-zA-Z0-9_-]+\s*[=])/g
    const cookieStrs = cookieString.split(cookieStringSplitter)
    const setCookie = promisify(cookieJar.setCookie.bind(cookieJar))

    await Promise.all(cookieStrs.map(cookieStr => setCookie(cookieStr, uri)))
  }

  const addResponseCookies = async ({ response, uri, page }) => {
    const metas = page.search('//head/meta[@http-equiv="Set-Cookie"]')

    const cookieStrings = metas.map(meta => nodeAttr(meta, 'content'))
      .concat(response.headers.raw()['set-cookie'])
      .filter(cookieString => cookieString)

    await Promise.all(cookieStrings.map(cookieString => addResponseCookie({
      cookieString,
      uri,
    })))
  }

  const getCookieString = async uri => {
    const getCookiesP = promisify(cookieJar.getCookies.bind(cookieJar))
    const cookies = await getCookiesP(uri)
    const cookieStrs = cookies && cookies.map(cookie => cookie.cookieString())

    return cookieStrs && cookieStrs.join('; ')
  }

  const requestHeaders = async options => {
    const headers = {
      'User-Agent': userAgent,
      Accept: '*/*',
    }
    const referer = options.referer || history.currentPage() ||
        newPage({
          response: {
            'content-type': 'text/html',
          },
          agent,
        })

    Object.assign(headers, options.headers)

    let refererURI
    if (typeof referer === 'string') {
      refererURI = referer
    } else if (referer) {
      refererURI = referer.uri
    }

    if (refererURI) {
      const parsedURI = new URL(refererURI)

      headers.Referer = refererURI
      headers.Origin = parsedURI.protocol + '//' + parsedURI.host
    }
    const uri = new URL(options.uri, refererURI).toString()
    const cookieString = await getCookieString(uri)
    if (cookieString) {
      headers.cookie = cookieString
    }
    return headers
  }

  const encodeBody = options => options.body

  const requestOptions = async options => {
    // uri
    // baseUrl
    // method
    // headers
    // qs
    // qsParseOptions
    // qsStringifyOptions
    // useQuerystring
    // body
    // form
    // formData
    // multipart
    // preambleCRLF
    // postambleCRLF
    // json
    // jsonReviver
    // jsonReplacer
    // auth
    // oauth
    // hawk
    // aws
    // httpSignature
    // followRedirect
    // followAllRedirects
    // followOriginalHttpMethod
    // maxRedirects
    // removeRefererHeader
    // encoding
    // gzip
    // jar
    // agent
    // agentClass
    // agentOptions
    // forever
    // pool
    // timeout
    // localAddress
    // proxy
    // strictSSL
    // tunnel
    // proxyHeaderWhiteList
    // proxyHeaderExclusiveList
    // time
    // har
    const reqOptions = {
      headers: await requestHeaders(options),
      body: encodeBody(options),
      followAllRedirects: options.followAllRedirects,
    }
    if (reqOptions.headers.Referer) {
      reqOptions.uri =
          new URL(options.uri, reqOptions.headers.Referer).toString()
    } else {
      reqOptions.uri = options.uri.toString()
    }
    reqOptions.method = (options.verb && options.verb.toUpperCase()) || 'GET'

    reqOptions.encoding = options.encoding === 'undefined'
      ? null
      : options.encoding
    reqOptions.resolveWithFullResponse = true

    return reqOptions
  }

  const logPage = async ({ body, uri, response }) => {
    const contentType = response.headers.raw()['content-type']
    const ext = mime.extension(contentType &&
                                 contentType.split(/[ \t]*;[ \t]*/)[0])
    const timestamp = new Date().toISOString().replaceAll(/[-T:.Z]/g, '')
    const filename = path.join(
      logDir,
      timestamp + '_' +
            path.basename(uri, path.extname(uri))) +
        (ext
          ? '.' + ext
          : '')
    const encoding = 'utf8'

    await writeFile(filename, body, {
      encoding,
    })
    return filename
  }

  const fetchPage = async options => {
    const reqOptions = await requestOptions(options)
    const uri = reqOptions.uri
    const response = await fetch(
      uri,
      reqOptions
    )

    let responseBody = await response.text()

    if (reqOptions.encoding === null) {
      const body = responseBody
      if (body[0] === 0xEF && body[1] === 0xBB && body[2] === 0xBF) {
        // encoded UTF-8
        const body2 = Buffer.allocUnsafe(body.length - 3)
        body.copy(body2, 0, 3)
        responseBody = body2.toString('utf8')
      } else if (body[0] === 0xFE && body[1] === 0xFF) {
        // encoded UTF-16 big-endian
        body.swap16()
        const body2 = Buffer.allocUnsafe(body.length - 2)
        body.copy(body2, 0, 2)
        responseBody = body2.toString('utf16le')
      } else if (body[0] === 0xFF && body[1] === 0xFE) {
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
        responseBody = windows1252.decode(responseBody)
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

  const setLogDir = dir => {
    logDir = dir
  }

  const submit = ({ form, button, headers, followAllRedirects }) => {
    const action = (button && button.action) || form.action || ''
    const enctype = (button && button.enctype) || form.enctype
    const method = (button && button.method) || form.method
    let verb
    let params
    let body
    let uri = (action && querystring.unescape(action)) ||
        (form.page && form.page.uri)
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

    return fetchPage({
      verb,
      uri,
      headers: Object.assign(requestHeaders, headers),
      referer: form.page,
      followAllRedirects,
      params,
      body,
    })
  }

  const setUserAgent = agentAlias => {
    userAgent = USER_AGENTS[agentAlias]
  }

  const getCookies = ({ domain, path = '/', secure = true }) => {
    const protocol = secure
      ? 'https'
      : 'http'
    const currentUrl = `${protocol}://${domain}${path}`
    const getCookiesP = promisify(cookieJar.getCookies.bind(cookieJar))

    return getCookiesP(currentUrl)
  }

  const setCookie = promisify(cookieJar.setCookie.bind(cookieJar))

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

exports.newAgent = newAgent
