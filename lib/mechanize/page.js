var libxml = require('libxmljs'),
util = require('util'),
File = require('./file'),
Form = require('./form'),
Link = require('./page/link'),

Page = module.exports = function (agent, uri, response, body, code) {
  File.call(this, agent, uri, response, body, code);

  this.doc = libxml.parseHtmlString(body);
  this.userAgent = agent.userAgent;
  this.userAgentVersion = agent.userAgentVersion;
  this.labels = {};  // TODO: initialize
};

util.inherits(Page, File);

Page.prototype.form = function (name) {
  var that = this,
  form;
  this.doc.find('//form').forEach(function (element) {
    if (element.attr('id') && element.attr('id').value() === name ||
        element.attr('name') && element.attr('name').value() === name) {
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
