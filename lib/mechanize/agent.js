var request = require('request');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var url = require('url');
var History = require('./history');
var Page = require('./page');
var Cookie = require('cookiejar').Cookie;
var CookieJar = require('cookiejar').CookieJar;
var CookieAccessInfo = require('cookiejar').CookieAccessInfo;

// From connect/lib/utils.js by TJ Holowaychuk
function merge(a, b) {
  var key;
  if (a && b) {
    for (key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
  }
  return a;
}

function pad(n) {
  return n < 10 ? '0' + n : n;
}

function pad3(n) {
  return n < 10 ? '00' + n : n < 100 ? '0' + n : n;
}

function getTimestamp() {
  var now = new Date();
  return now.getUTCFullYear() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds()) + '_' +
    pad3(now.getUTCSeconds()) + '000';
}

function logPage(agent, body, options, response, fn) {
  var contentType, encoding, ext, filename;
  contentType = response.headers['content-type'];
  encoding = contentType.split(';')[1];
  ext = mime.extension(contentType && contentType.split(';')[0]);
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
}

function addToHistory(agent, page) {
  agent.history.push(page);
}

function requestHeaders(agent, options) {
  var headers, refererURI, parsedURI;
  headers = {};

  headers["User-Agent"] = agent.userAgentAlias;
  headers.Accept = '*/*';
  if (options.headers) {
    merge(headers, options.headers);
  }

  if (options.referer) {
    if (typeof (options.referer) === 'string') {
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
}

function requestCookies(agent, uri) {
  var parsedURI, domain, path, secure, script, accessInfo, cookies;
  parsedURI = url.parse(uri);
  domain = parsedURI.hostname;
  path = parsedURI.pathname;
  secure = parsedURI.protocol === 'https:';
  script = false;
  accessInfo = new CookieAccessInfo(domain, path, secure, script);
  cookies = agent.cookieJar.getCookies(accessInfo);
  return cookies && cookies.map(function (cookie) {
    return cookie.toValueString();
  });

}


function requestOptions(agent, options) {
  var reqOptions = {}, cookies;

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
  reqOptions.headers = requestHeaders(agent, options);
  if (reqOptions.headers.Referer) {
    reqOptions.uri =
      url.resolve(reqOptions.headers.Referer, options.uri).toString();
  } else {
    reqOptions.uri = options.uri.toString();
  }
  cookies = requestCookies(agent, reqOptions.uri);
  if (cookies) {
    reqOptions.headers.Cookie = cookies.join('; ');
  }

  if (options.verb) {
    reqOptions.method = options.verb.toUpperCase();
  }
	if (options.encoding !== 'undefined') {
		reqOptions.encoding = options.encoding;
	}

  reqOptions.body = options.body;
  reqOptions.followAllRedirects = options.followAllRedirects;
  return reqOptions;
}

function addResponseCookie(cookieJar, cookieString, domain, path) {
  var cookieStringSplitter = /[:](?=\s*[a-zA-Z0-9_\-]+\s*[=])/g;
  cookieString.split(cookieStringSplitter).forEach(function (cookieStr) {
    var cookie, successful;
    cookie = new Cookie(cookieStr);
    if (!cookie.domain) {
      cookie.domain = domain;
    }
    if (!cookie.path) {
      cookie.path = path;
    }
    successful = cookieJar.setCookie(cookie);
  });
}

function addResponseCookies(cookieJar, response, uri, page) {
  var cookieHeaders, domain, path;
  domain = uri.hostname;
  path = uri.pathname;

  page.search('//head/meta[@http-equiv="Set-Cookie"]').forEach(function (meta) {
    if (meta.attr('content') && meta.attr('content').value()) {
      addResponseCookie(cookieJar, meta.attr('content').value(), domain, path);
    }
  });

  cookieHeaders = response.headers && response.headers['set-cookie'];
  if (cookieHeaders && !Array.isArray(cookieHeaders)) {
    cookieHeaders = [cookieHeaders];
  }
  if (cookieHeaders) {
    cookieHeaders.forEach(function (header) {
      if (header) {
        addResponseCookie(cookieJar, header, domain, path);
      }
    });
  }
}

function fetchPage(agent, options, fn) {
  options = requestOptions(agent, options);
  agent.request(options, function (err, response, body) {
    var newPage, code;
    code = null;
    if (err) {
      return fn && fn(err);
    }
    newPage = new Page(options.uri, response, body, code, agent);
    addResponseCookies(agent.cookieJar, response, url.parse(options.uri),
                       newPage);
    addToHistory(agent, newPage);
    if (agent.logPages && agent.logDir) {
      logPage(agent, body, options, response, function (err, filename) {
        return fn && fn(null, newPage);
      });
    } else {
      return fn && fn(null, newPage);
    }
  });
}

function Agent() {
  var userAgentVersion = "5.0 (Macintosh; Intel Mac OS X 10_6_8) " +
        "AppleWebKit/535.1 " +
        "(KHTML, like Gecko) Chrome/14.0.835.159 Safari/535.1";

  this.userAgentVersion = userAgentVersion;
  this.userAgent = "Mozilla/" + userAgentVersion;
  this.history = new History();
  this.logPages = true;
  this.logDir = null;
  this.request = request;
  this.cookieJar = new CookieJar();
}

Agent.prototype.currentPage = function () {
  return this.history.currentPage;
};

Agent.prototype.get = function (options, fn) {
  var currentPage = this.currentPage() ||
        new Page(null, {'content-type': 'text/html'}, null, null, this);
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
    options.referer = currentPage;
  }
  fetchPage(this, options, fn);
};

Agent.prototype.submit = function (form, button, headers, requestOptions, fn) {
  if (button) {
    form.addButtonToQuery(button);
  }
  if (!headers) {
    headers = {};
  }
  if (form.method.match(/^post$/i)) {
    this.postForm(form.action, form, headers, requestOptions, fn);
  } else if (form.method.match(/^get$/i)) {
    var actionUrl = form.action.replace(/\?[!#$&-;=?-\[\]_a-z~]*$/, '');
    this.get({uri: actionUrl,
              params: form.buildQuery(),
              headers: headers,
              referer: form.page}, fn);
  } else {
    fn({error: "unsupported method: " + form.method});
  }
};

Agent.prototype.postForm = function (uri, form, headers, requestOptions, fn) {
  var currentPage, requestData, requestHeaders, options;
  currentPage = form.page || this.currentPage() ||
        new Page(null, {'content-type': 'text/html'}, null, null, this);
  requestData = form.requestData();
  requestHeaders = {
    'Content-Type': form.enctype,
    'Content-Length': requestData.length.toString()
  };
  options = {
    uri: uri,
    referer: currentPage,
    verb: 'post',
    body: requestData,
    headers: merge(requestHeaders, headers),
    followAllRedirects: requestOptions.followAllRedirects
  };
  fetchPage(this, options, fn);
};

module.exports = Agent;
