var libxml = require('libxmljs'),

File = module.exports = function (uri, response, body, code, agent) {
  this.uri = uri;
  this.response = response;
  this.body = body;
  this.code = code;
  this.agent = agent;
};
