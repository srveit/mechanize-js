var request = require('request'),
path = require('path'),
mime = require('mime'),
fs = require('fs'),
url = require('url'),
History = require('./history'),
Page = require('./page'),
CookieJar = require('cookiejar').CookieJar,
CookieAccessInfo = require('cookiejar').CookieAccessInfo,

// From connect/lib/utils.js by TJ Holowaychuk
merge = function (a, b) {
  if (a && b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
},

getTimestamp = function () {
  var pad = function (n) {
    return n < 10 ? '0' + n : n;
  },
  pad3 = function (n) {
    return n < 10 ? '00' + n : n < 100 ? '0' + n : n;
  },
  now = new Date(),
  timestamp = now.getUTCFullYear() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds()) + '_' +
    pad3(now.getUTCSeconds()) + '000';
  return timestamp;
},

logPage = function (agent, body, options, response, fn) {
  var contentType = response.headers['content-type'],
  encoding = contentType.split(';')[1],
  ext = mime.extension(contentType && contentType.split(';')[0]),
  filename = 
    path.join(agent.logDir,
              getTimestamp() + '_' +
              path.basename(options.uri, path.extname(options.uri))) +
    (ext ? '.' + ext : '');
  encoding = 'utf8';
  fs.writeFile(filename, body, 0, encoding, function (err) {
    console.log("wrote file://" + filename);
    return fn && fn(null, filename);
  });
},

addToHistory = function (agent, page) {
  agent.history.push(page);
},

requestHeaders = function (agent, options) {
  var headers = {},
  refererURI,
  parsedURI;

  headers["User-Agent"] = agent.userAgentAlias;
  if (options.headers) {
    merge(headers, options.headers);
  }

  if (options.referer) {
    if (typeof(options.referer) === 'string') {
      refererURI = options.referer;
    } else {
      refererURI = options.referer.uri;
    }
  }

  if (refererURI) {
    headers.Referer = refererURI;
    parsedURI = url.parse(refererURI);
    headers.Origin = parsedURI.protocol + '//' + parsedURI.host;
  }

  return headers;
},

requestCookies = function (agent, uri) {
  var parsedURI = url.parse(uri),
  domain = parsedURI.hostname,
  path = parsedURI.pathname,
  secure = parsedURI.protocol === 'https',
  script = false,
  accessInfo = new CookieAccessInfo(domain, path, secure, script),
  cookies = agent.cookieJar.getCookies(accessInfo);
  console.log("accessInfo: " + require('sys').inspect(accessInfo));
  console.log("cookies: " + require('sys').inspect(cookies));
  return cookies && cookies.map(function (cookie) {
    return cookie.toValueString();
  });

},


requestOptions = function (agent, options) {
  var reqOptions = {}, cookies;

  reqOptions.headers = requestHeaders(agent, options);
  reqOptions.uri = 
    url.resolve(reqOptions.headers.Referer, options.uri).toString();
  cookies = requestCookies(agent, reqOptions.uri);
  if (cookies) {
    reqOptions.headers.Cookie = cookies.join('; ');
  }

  if (options.verb) {
    reqOptions.method = options.verb.toUpperCase();
  }
  reqOptions.body = options.body;
  return reqOptions;
},

fetchPage = function (agent, options, fn) {
  // console.log("before options: " + require('sys').inspect(options));
  options = requestOptions(agent, options);
  // console.log("options: " + require('sys').inspect(options));
  agent.request(options, function (err, response, body) {
    var newPage,
    code = null;
    if (err) {
      return fn && fn(err);
    } else {
      newPage = new Page(options.uri, response, body, code, agent);
      // console.log("status: " + response.statusCode);
      addToHistory(agent, newPage);
      if (agent.logPages && agent.logDir) {
        logPage(agent, body, options, response, function (err, filename) {
          return fn && fn(null, newPage);
        });
      } else {
        return fn && fn(null, newPage);
      }
    }
  });
},

Agent = module.exports = function Agent() {
  var userAgentVersion = "5.0 (Macintosh; Intel Mac OS X 10_6_7) " + 
    "AppleWebKit/534.30 " +
    "(KHTML, like Gecko) Chrome/12.0.742.77 Safari/534.30";

  this.userAgentVersion = userAgentVersion;
  this.userAgent = "Mozilla/" + userAgentVersion;
  this.history = new History();
  this.logPages = true;
  this.logDir = null;
  this.request = request;
  this.cookieJar = new CookieJar();
};

Agent.prototype.currentPage = function () {
  return this.history.currentPage;
};

Agent.prototype.get = function (options, fn) {
  if (!options.verb) {
    options.verb = 'get';
  }
  if (!options.params) {
    options.params = [];
  }
  if (!options.headers) {
    options.headers = [];
  }
  fetchPage(this, options, fn);
};

Agent.prototype.submit = function (form, button, headers, fn) {
  if (button) {
    form.addButtonToQuery(button);
  }
  if (!headers) {
    headers = {};
  }
  if (form.method.match(/^post$/i)) {
    this.postForm(form.action, form, headers, fn);
  } else if (form.method.match(/^get$/i)) {
    this.get({url: form.action.replace(/\?[^\?]*$/, ''),
              params: form.build_query(),
              headers: headers,
              referer: form.page}, fn);
  } else {
    fn({error: "unsupported method: " + form.method});
  }
};

Agent.prototype.postForm = function (uri, form, headers, fn) {
  var currentPage = form.page || this.currentPage() || 
    new Page(null, {'content-type': 'text/html'}, null, null, this),
  requestData = form.requestData(),
  requestHeaders = {
    'Content-Type': form.enctype,
    'Content-Length': requestData.length.toString()
  },
  options = {
    uri: uri,
    referer: currentPage,
    verb: 'post',
    body: requestData,
    headers: merge(requestHeaders, headers)
  };
  fetchPage(this, options, fn);
};
