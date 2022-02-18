'use strict';

const fs = require('fs'),
  {promisify} = require('util'),
  writeFile = promisify(fs.writeFile),
  windows1252 = require('windows-1252'),
  mime = require('mime'),
  path = require('path'),
  {URL} = require('url'),
  {Cookie, CookieJar} = require('tough-cookie'),
  fetch = require('node-fetch'),
  moment = require('moment'),
  querystring = require('querystring'),
  {newHistory} = require('./history'),
  {newPage} = require('./page'),
  {USER_AGENTS} = require('./constants'),
  {nodeAttr} = require('./utils.js');

const newAgent = () => {
  let logPages = true,
    logDir,
    userAgent = USER_AGENTS.Mechanize;

  const history = newHistory(),
    cookieJar = new CookieJar(null, { rejectPublicSuffixes: false }),

    addResponseCookie = async ({cookieString, uri, domain, path}) => {
      const cookieStringSplitter = /[:](?=\s*[a-zA-Z0-9_-]+\s*[=])/g,
        cookieStrs = cookieString.split(cookieStringSplitter),
        setCookie = promisify(cookieJar.setCookie.bind(cookieJar));

      for (const cookieStr of cookieStrs) {
        const cookie = Cookie.parse(cookieStr);
        await setCookie(cookie, uri);
      }
    },

    addResponseCookies = async ({response, uri, page}) => {
      const domain = uri.hostname,
        path = uri.pathname,
        metas = page.search('//head/meta[@http-equiv="Set-Cookie"]');
      
      for (const meta of metas) {
        if (nodeAttr({node: meta, name: 'content'})) {
          await addResponseCookie({
            cookieString: nodeAttr({node: meta, name: 'content'}),
            uri,
            domain,
            path
          });
        }
      }
      let cookieHeaders =
        response.headers.raw()['set-cookie'] || [];
      if (!Array.isArray(cookieHeaders)) {
        cookieHeaders = [cookieHeaders];
      }
      for (const header of cookieHeaders) {
        if (header) {
          await addResponseCookie({
            cookieString: header,
            uri,
            domain,
            path
          });
        }
      }
    },

    requestHeaders = async options => {
      const headers = {
        'User-Agent': userAgent,
        Accept: '*/*'
      },
        referer = options.referer || history.currentPage() ||
              newPage({response: {'content-type': 'text/html'}, agent});


      Object.assign(headers, options.headers);

      let refererURI;
      if (typeof (referer) === 'string') {
        refererURI = referer;
      } else if (referer) {
        refererURI = referer.uri;
      }

      if (refererURI) {
        const parsedURI = new URL(refererURI);

        headers.Referer = refererURI;
        headers.Origin = parsedURI.protocol + '//' + parsedURI.host;
      }
      const uri = new URL(options.uri, refererURI).toString();
      const cookieString = await getCookieString(uri);
      if (cookieString) {
        headers.cookie = cookieString;
      }
      return headers;
    },

    encodeBody = options => {
      return options.body;
    },

    requestOptions = async options => {
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
        followAllRedirects: options.followAllRedirects
      };
      if (reqOptions.headers.Referer) {
        reqOptions.uri =
          new URL(options.uri, reqOptions.headers.Referer).toString();
      } else {
        reqOptions.uri = options.uri.toString();
      }
      reqOptions.method = options.verb && options.verb.toUpperCase() || 'GET';

      reqOptions.encoding = (options.encoding === 'undefined') ?
        null :
        options.encoding;
      reqOptions.resolveWithFullResponse = true;

      return reqOptions;
    },

    logPage = async ({body, uri, response}) => {
      const contentType = response.headers.raw()['content-type'],
        ext = mime.extension(contentType &&
                                 contentType.split(/[ \t]*;[ \t]*/)[0]),
        timestamp = moment.utc().format('YYYYMMDDHHmmssSSSSSS'),
        filename = path.join(
          logDir,
          timestamp + '_' +
            path.basename(uri, path.extname(uri))) +
              (ext ? '.' + ext : ''),
        encoding = 'utf8';

      await writeFile(filename, body, {encoding});
      return filename;
    },

    fetchPage = async options => {
      const reqOptions = await requestOptions(options),
        uri = reqOptions.uri,
          response = await fetch(
            uri,
            reqOptions
          );

      let responseBody = await response.text();

      if (reqOptions.encoding === null) {
        const body = responseBody;
        if (body[0] === 0xEF && body[1] === 0xBB && body[2] === 0xBF) {
          // UTF-8
          const body2 = Buffer.allocUnsafe(body.length - 3);
          body.copy(body2, 0, 3);
          responseBody = body2.toString('utf8');
        } else if (body[0] === 0xFE && body[1] === 0xFF) {
          // UTF-16 big-endian
          body.swap16();
          const body2 = Buffer.allocUnsafe(body.length - 2);
          body.copy(body2, 0, 2);
          responseBody = body2.toString('utf16le');
        } else if (body[0] === 0xFF && body[1] === 0xFE) {
          // UTF-16 little-endian
          const body2 = Buffer.allocUnsafe(body.length - 2);
          body.copy(body2, 0, 2);
          responseBody = body2.toString('utf16le');
        } else {
          // UTF-8
          responseBody = body.toString('binary');
        }
      }
      if (options.fixCharset) {
        responseBody = responseBody.replace('charset=utf-16le', 'utf-8');
        if (responseBody.match(/charset=windows-1252/)) {
          responseBody = windows1252.decode(responseBody);
        }
      }
      const page = newPage({
        uri,
        response,
        body: responseBody,
        agent
      });

      await addResponseCookies({
        response,
        uri: new URL(uri),
        page
      });
      history.push(page);
      if (logPages && logDir) {
        await logPage({body: responseBody, uri, response});
      }
      return page;
    },

    submit = ({form, button, headers, followAllRedirects}) => {
      const action = button && button.action || form.action || '',
        enctype = button && button.enctype || form.enctype,
        method = button && button.method || form.method;
      let verb,
        params,
        body,
        uri = action && querystring.unescape(action) ||
            form.page && form.page.uri,
        contentType = enctype,
        requestHeaders = {};

      if (button) {
        form.addButtonToQuery(button);
      }
      if (method && method.toLowerCase() === 'post') {
        if (contentType === 'multipart/form-data') {
          contentType += '; boundary=' + form.boundary;
        }
        verb = 'post';
        body = form.requestData(enctype);
        requestHeaders = {
          'Content-Type': contentType,
          'Content-Length': body.length.toString()
        };
      } else {
        verb = 'get';
        uri = uri.replace(/\?[!#$&-;=?-[\]_a-z~]*$/, '');
        params = form.buildQuery();
      }

      return fetchPage({
        verb,
        uri,
        headers: Object.assign(requestHeaders, headers),
        referer: form.page,
        followAllRedirects,
        params,
        body
      });
    },

    setUserAgent = agentAlias => userAgent = USER_AGENTS[agentAlias],

    getCookies = ({domain, path = '/', secure = true}) => {
      const currentUrl = `${secure ? 'https' : 'http'}://${domain}${path}`,
        getCookiesP = promisify(cookieJar.getCookies.bind(cookieJar));

      return getCookiesP(currentUrl);
    },

    getCookieString = async uri => {
      const getCookiesP = promisify(cookieJar.getCookies.bind(cookieJar)),
        cookies = await getCookiesP(uri),
        cookieStrs = cookies && cookies.map(cookie => cookie.cookieString());

      return cookieStrs && cookieStrs.join('; ');
    },

    setCookie = promisify(cookieJar.setCookie.bind(cookieJar)),

    agent = {
      get: fetchPage,
      getCookies,
      getCookieString,
      setCookie,
      setUserAgent,
      submit,
      userAgent: () => userAgent
    };

  cookieJar.getCookieString = getCookieString;
  return Object.freeze(agent);
};

exports.newAgent = newAgent;
