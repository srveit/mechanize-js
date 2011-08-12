var request = require('request'),
path = require('path'),
mime = require('mime'),
fs = require('fs'),
url = require('url'),
History = require('./history'),
Page = require('./page'),

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

requestOptions = function (agent, options) {
  var headers = options.headers || {},
  reqOptions = {},
  referrerURI,
  parsedURI;

  headers["User-Agent"] = agent.userAgentAlias;
  if (options.referrer) {
    if (typeof(options.referrer) === 'string') {
      referrerURI = options.referrer;
    } else {
      referrerURI = options.referrer.uri;
    }
  }

  if (referrerURI) {
    headers.Referer = referrerURI;
    parsedURI = url.parse(referrerURI);
    headers.Origin = parsedURI.protocol + '//' + parsedURI.host;
  }

  reqOptions.uri = url.resolve(referrerURI, options.uri);
  if (options.verb) {
    reqOptions.method = options.verb.toUpperCase();
  }
  reqOptions.headers = headers;
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
              referrer: form.page}, fn);
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
    referrer: currentPage,
    verb: 'post',
    params: [requestData],
    headers: merge(requestHeaders, headers)
  };
  fetchPage(this, options, fn);
};
