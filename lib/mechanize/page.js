var libxml = require('libxmljs');
var util = require('util');
var File = require('./file');
var Form = require('./form');
var Link = require('./page/link');

function Page(uri, response, body, code, agent) {
  File.call(this, uri, response, body, code, agent);

  this.doc = body && libxml.parseHtmlString(body);
  this.userAgent = agent.userAgent;
  this.userAgentVersion = agent.userAgentVersion;
  this.labels = {};  // TODO: initialize
}

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
  var headers, charsets;
  headers = this.response.headers || {};
  charsets = [];

  Object.keys(headers).forEach(function (header) {
    var value, m;
    if (header) {
      value = headers[header];
      m = value && /charset=([\-().:_0-9a-zA-z]+)/.exec(value);
      if (m) {
        charsets.push(m[1]);
      }
    }
  });
  return charsets;
});

Page.prototype.statusCode = function (xpath) {
  return this.response && this.response.statusCode;
};

Page.prototype.search = function (xpath) {
  if (this.doc && this.doc.root()) {
    return this.doc.find(xpath);
  }
  return [];
};

Page.prototype.form = function (name) {
  var that, form, num = 0;
  that = this;

  // Loop through forms on page and return form where 'name' parameter
  // matches index, id attribute, or name attribute
  this.doc.find('//form').forEach(function (element) {
    if ((typeof name === "number" && name === num) ||
        (element.attr('id') && element.attr('id').value() === name) ||
        (element.attr('name') && element.attr('name').value() === name)) {
      form = new Form(that, element);
    }
    num++;
  });
  return form;
};

Page.prototype.submit = function (form, button, headers, requestOptions, fn) {
  this.agent.submit(form, button, headers, requestOptions, function (err, page) {
    fn(err, page);
  });
};

Page.prototype.labelFor = function (id) {
  return this.labels[id];
};

Page.prototype.links = function () {
  var that, links;
  that = this;
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

module.exports = Page;
