'use strict';
const fs = require('fs'),
  util = require('util'),
  writeFile = util.promisify(fs.writeFile),
  windows1252 = require('windows-1252'),
  mime = require('mime'),
  path = require('path'),
  {URL} = require('url'),
  {Cookie, CookieJar, CookieAccessInfo} = require('cookiejar'),
  request = require('request-promise'),
  moment = require('moment'),
  querystring = require('querystring'),
  {newHistory} = require('./history'),
  {newPage} = require('./page'),
  {USER_AGENTS} = require('./constants'),

newAgent = () => {
  let logPages = true,
    logDir,
    userAgent = USER_AGENTS.Mechanize;

  const history = newHistory(),
    cookieJar = new CookieJar(),

    addResponseCookie = ({cookieString, domain, path}) => {
      const cookieStringSplitter = /[:](?=\s*[a-zA-Z0-9_-]+\s*[=])/g;
      cookieString
        .split(cookieStringSplitter)
        .forEach(cookieStr => {
          const cookie = new Cookie(cookieStr);
          if (!cookie.domain) {
            cookie.domain = domain;
          }
          if (!cookie.path) {
            cookie.path = path;
          }
          cookieJar.setCookie(cookie);
        });
    },

    addResponseCookies = ({response, uri, page}) => {
      const domain = uri.hostname,
        path = uri.pathname;

      page.search('//head/meta[@http-equiv="Set-Cookie"]')
        .forEach(meta => {
          if (meta.attr('content') && meta.attr('content').value()) {
            addResponseCookie({
              cookieString: meta.attr('content').value(),
              domain,
              path
            });
          }
        });

      let cookieHeaders =
              response.headers && response.headers['set-cookie'] || [];
      if (!Array.isArray(cookieHeaders)) {
        cookieHeaders = [cookieHeaders];
      }
      cookieHeaders.forEach(header => {
        if (header) {
          addResponseCookie({cookieString: header, domain, path});
        }
      });
    },

    requestHeaders = options => {
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

      return headers;
    },

    requestCookies = uri => {
      const parsedURI = new URL(uri),
        domain = parsedURI.hostname,
        path = parsedURI.pathname,
        secure = parsedURI.protocol === 'https:',
        script = false,
        accessInfo = new CookieAccessInfo(domain, path, secure, script),
        cookies = cookieJar.getCookies(accessInfo);

      return cookies && cookies.map(cookie => cookie.toValueString());
    },

    getCookieString = uri => {
      const cookies = requestCookies(uri);
      return cookies && cookies.join('; ');
    },

    requestOptions = options => {
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
        headers: requestHeaders(options),
        body: options.body,
        followAllRedirects: options.followAllRedirects
      };
      if (reqOptions.headers.Referer) {
        reqOptions.uri =
          new URL(options.uri, reqOptions.headers.Referer).toString();
      } else {
        reqOptions.uri = options.uri.toString();
      }
      reqOptions.jar = cookieJar;
      reqOptions.method = options.verb && options.verb.toUpperCase() || 'GET';

      if (options.encoding !== 'undefined') {
        reqOptions.encoding = options.encoding;
      }
      reqOptions.encoding = null;
      reqOptions.resolveWithFullResponse = true;

      return reqOptions;
    },

    logPage = async ({body, uri, response}) => {
      const contentType = response.headers['content-type'],
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
      const reqOptions = requestOptions(options),
        uri = reqOptions.uri,
        response = await request(reqOptions);

      if (reqOptions.encoding === null) {
        const body = response.body;
        if (body[0] === 0xEF && body[1] === 0xBB && body[2] === 0xBF) {
          // UTF-8
          const body2 = Buffer.allocUnsafe(body.length - 3);
          body.copy(body2, 0, 3);
          response.body = body2.toString('utf8');
        } else if (body[0] === 0xFE && body[1] === 0xFF) {
          // UTF-16 big-endian
          body.swap16();
          const body2 = Buffer.allocUnsafe(body.length - 2);
          body.copy(body2, 0, 2);
          response.body = body2.toString('utf16le');
        } else if (body[0] === 0xFF && body[1] === 0xFE) {
          // UTF-16 little-endian
          const body2 = Buffer.allocUnsafe(body.length - 2);
          body.copy(body2, 0, 2);
          response.body = body2.toString('utf16le');
        } else {
          // UTF-8
          response.body = body.toString('binary');
        }
      }
      if (options.fixCharset) {
        response.body = response.body.replace('charset=utf-16le', 'utf-8');
        if (response.body.match(/charset=windows-1252/)) {
          response.body = windows1252.decode(response.body);
        }
      }
      const page = newPage({
        uri,
        response,
        body: response.body,
        code: response.statusCode,
        agent
      });

      addResponseCookies({
        response,
        uri: new URL(uri),
        page
      });
      history.push(page);
      if (logPages && logDir) {
        await logPage({body: response.body, uri, response});
      }
      return page;
    },

    submit = ({form, button, headers, followAllRedirects}) => {
      const action = button && button.action || form.action || '',
        enctype = button && button.enctype || form.enctype,
        method = button && button.method || form.method;
      let verb, params, body,
        uri = action && querystring.unescape(action) ||
            form.page && form.page.uri,
        contentType = enctype, requestHeaders = {};

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

    getCookies = ({domain, path = '/', secure = true, script = false}) =>
      cookieJar.getCookies(new CookieAccessInfo(domain, path, secure, script)),

    setCookie = cookie => cookieJar.setCookie(cookie),

    agent = {
      get: fetchPage,
      getCookies,
      setCookie,
      setUserAgent,
      submit,
      userAgent: () => userAgent
    };

  cookieJar.getCookieString = getCookieString;
  return Object.freeze(agent);
};

exports.newAgent = newAgent;
