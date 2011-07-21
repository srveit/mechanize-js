var libxml = require('libxmljs'),

File = module.exports = function (agent, uri, response, body, code) {
  this.agent = agent;
  this.uri = uri;
  this.response = response;
  this.body = body;
  this.code = code;
};
