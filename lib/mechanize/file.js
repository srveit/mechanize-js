var libxml = require('libxmljs');

function File(uri, response, body, code, agent) {
  this.uri = uri;
  this.response = response;
  this.body = body;
  this.code = code;
  this.agent = agent;
}

module.exports = File;
