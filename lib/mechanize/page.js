var libxml = require('libxmljs'),
util = require('util'),
File = require('./file'),
Form = require('./form'),
Link = require('./page/link'),

Page = module.exports = function (uri, response, body, code, agent) {
  File.call(this, uri, response, body, code, agent);

  this.doc = body && libxml.parseHtmlString(body);
  this.userAgent = agent.userAgent;
  this.userAgentVersion = agent.userAgentVersion;
  this.labels = {};  // TODO: initialize
};

util.inherits(Page, File);

Page.prototype.__defineGetter__('title', function () {
  var node;
  if (!this._title) {
    node = this.doc.get('//title');
    if (node) {
      this._title = node.text();
    }
  }
  return this._title;
});

Page.prototype.__defineGetter__('responseHeaderCharset', function () {
  var headers = this.response.headers || [],
  header,
  value,
  m,
  charsets = [];

  for (header in headers) {
    if (header) {
      value = headers[header];
      m = value && /charset=([\-().:_0-9a-zA-z]+)/.exec(value);
      if (m) {
        charsets.push(m[1]);
      }
    }
  }
  return charsets;
});

Page.prototype.search = function (xpath) {
  return this.doc.find(xpath);
};

Page.prototype.form = function (name) {
  var that = this,
  form;
  this.doc.find('//form').forEach(function (element) {
    if ((element.attr('id') && element.attr('id').value() === name) ||
        (element.attr('name') && element.attr('name').value() === name)) {
      form = new Form(that, element);
    }
  });
  return form;
};

Page.prototype.submit = function (form, button, headers, fn) {
  this.agent.submit(form, button, headers, function (err, page) {
    fn(err, page);
  });
};

Page.prototype.labelFor = function (id) {
  return this.labels[id];
};

Page.prototype.links = function () {
  var that = this,
  links = this._links;
  if (!links) {
    links = [];
    ['a', 'area'].forEach(function (tag) {
      that.doc.find('//' + tag).forEach(function (node) {
        links.push(new Link(that, node));
      });
    });
    this._links = links;
  }
  return links;
};

Page.prototype.at = function (xpath) {
  return this.doc.get(xpath);
};
