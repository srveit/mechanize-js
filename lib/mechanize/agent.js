'use strict';
const fs = require('fs'),
  mime = require('mime'),
  path = require('path'),
  url = require('url'),
  {Cookie, CookieJar, CookieAccessInfo} = require('cookiejar'),
  request = require('request-promise'),
  moment = require('moment'),
  querystring = require('querystring'),
  {newHistory} = require('./history'),
  {newPage} = require('./page'),
  {USER_AGENTS} = require('./constants');

exports.newAgent = () => {
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
        const parsedURI = url.parse(refererURI);

        headers.Referer = refererURI;
        headers.Origin = parsedURI.protocol + '//' + parsedURI.host;
      }

      return headers;
    },

    requestCookies = uri => {
      const parsedURI = url.parse(uri),
        domain = parsedURI.hostname,
        path = parsedURI.pathname,
        secure = parsedURI.protocol === 'https:',
        script = false,
        accessInfo = new CookieAccessInfo(domain, path, secure, script),
        cookies = cookieJar.getCookies(accessInfo);

      return cookies && cookies.map(cookie => cookie.toValueString());
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
          url.resolve(reqOptions.headers.Referer, options.uri).toString();
      } else {
        reqOptions.uri = options.uri.toString();
      }
      const cookies = requestCookies(reqOptions.uri);
      if (cookies) {
        reqOptions.headers.Cookie = cookies.join('; ');
      }

      reqOptions.method = options.verb && options.verb.toUpperCase() || 'GET';

      if (options.encoding !== 'undefined') {
        reqOptions.encoding = options.encoding;
      }
      reqOptions.resolveWithFullResponse = true;

      return reqOptions;
    },

    logPage = ({body, uri, response}) => {
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

      return new Promise(
        (resolve, reject) => fs.writeFile(filename, body, {encoding}, err => {
          if (err) {
            reject(err);
          }
          resolve(filename);
        })
      );
    },

    fetchPage = options => {
      const reqOptions = requestOptions(options),
            uri = reqOptions.uri;

      return request(reqOptions)
        .then(response => {
          const page = newPage({
            uri,
            response,
            body: response.body,
            code: response.statusCode,
            agent
          });

          addResponseCookies({
            response,
            uri: url.parse(uri),
            page
          });
          history.push(page);
          if (logPages && logDir) {
            return logPage({body: response.body, uri, response})
              .then(() => page)
              .catch(() => page);
          }
          return page;
        });
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
      if (method === 'post') {
        if (contentType === 'multipart/form-data') {
          contentType += '; boundary=' + form.boundary;
        }
        verb = 'post';
        body = form.requestData();
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
      get: options => fetchPage(options),
      getCookies,
      setCookie,
      setUserAgent,
      submit,
      userAgent: () => userAgent
    };

  return Object.freeze(agent);
};
