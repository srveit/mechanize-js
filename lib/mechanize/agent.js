'use strict';
const fs = require('fs'),
  mime = require('mime'),
  path = require('path'),
  url = require('url'),
  {Cookie, CookieJar, CookieAccessInfo} = require('cookiejar'),
  request = require('request-promise'),
  moment = require('moment'),
  {newHistory} = require('./history'),
  {newPage} = require('./page');


exports.newAgent = () => {
  let logPages = true,
    logDir;
  const userAgentVersion = '5.0 (Macintosh; Intel Mac OS X 10_6_8) ' +
          'AppleWebKit/535.1 ' +
          '(KHTML, like Gecko) Chrome/14.0.835.159 Safari/535.1',
    userAgent = 'Mozilla/' + userAgentVersion,
    history = newHistory(),
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

      const cookieHeaders =
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
      };

      Object.assign(headers, options.headers);

      let refererURI;
      if (typeof (options.referer) === 'string') {
        refererURI = options.referer;
      } else if (options.referer) {
        refererURI = options.referer.uri;
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
      // method
      // headers
      // body or json
      // multipart
      // followRedirect
      // maxRedirects
      // onResponse
      // encoding
      // pool
      // timeout
      // proxy
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

      if (options.verb) {
        reqOptions.method = options.verb.toUpperCase();
      }
      if (options.encoding !== 'undefined') {
        reqOptions.encoding = options.encoding;
      }

      return reqOptions;
    },

    logPage = ({body, reqOptions, response}) => {
      const contentType = response.headers['content-type'],
        ext = mime.extension(contentType &&
                                 contentType.split(/[ \t]*;[ \t]*/)[0]),
        timestamp = moment.utc().format('YYYYMMDDHHmmssSSSSSS'),
        filename = path.join(
          logDir,
          timestamp + '_' +
            path.basename(reqOptions.uri, path.extname(reqOptions.uri))) +
              (ext ? '.' + ext : ''),
        encoding = 'utf8';

      return new Promise(
        (resolve, reject) => fs.writeFile(filename, body, {encoding}, err => {
          if (err) {
            console.error('error logging page', filename, '-', err);
            reject(err);
          }
          console.log('wrote file://' + filename);
          resolve(filename);
        })
      );
    },

    fetchPage = options => {
      const reqOptions = requestOptions(options);

      return request(reqOptions)
        .then(response => {
          const code = null,
            page = newPage({
              uri: reqOptions.uri,
              response,
              body: response.body,
              code,
              agent
            });

          addResponseCookies({
            response,
            uri: url.parse(reqOptions.uri),
            page
          });
          history.push(page);
          if (logPages && logDir) {
            return logPage({body: response.body, reqOptions, response})
              .then(() => page)
              .catch(() => page);
          }
          return page;
        });
    },

    get = options => {
      const referer = history.currentPage() ||
              newPage({response: {'content-type': 'text/html'}, agent});

      if (!options.verb) {
        options.verb = 'get';
      }
      if (!options.params) {
        options.params = [];
      }
      if (!options.headers) {
        options.headers = [];
      }
      if (!options.referer) {
        options.referer = referer;
      }
      return fetchPage(options);
    },

    submit = ({form, button, headers, reqOptions}) => {
      if (button) {
        form.addButtonToQuery(button);
      }
      if (!headers) {
        headers = {};
      }
      if (form.method.match(/^post$/i)) {
        return postForm(form.action, form, headers, reqOptions);
      } else if (form.method.match(/^get$/i)) {
        const actionUrl = form.action.replace(/\?[!#$&-;=?-\[\]_a-z~]*$/, '');
        return get({
          uri: actionUrl,
          params: form.buildQuery(),
          headers: headers,
          referer: form.page
        });
      } else {
        return Promise.reject({error: 'unsupported method: ' + form.method});
      }
    },

    postForm = ({uri, form, headers, reqOptions}) => {
      const referer = form.page || history.currentPage() ||
              newPage({response: {'content-type': 'text/html'}, agent}),
        body = form.requestData(),
        requestHeaders = {
          'Content-Type': form.enctype,
          'Content-Length': body.length.toString()
        },
        options = {
          uri,
          referer,
          verb: 'post',
          body,
          headers: Object.assign(requestHeaders, headers),
          followAllRedirects: reqOptions.followAllRedirects
        };
      return fetchPage(options);
    },

    agent = {
      userAgentVersion,
      userAgent
    };

  return Object.freeze(agent);
};
