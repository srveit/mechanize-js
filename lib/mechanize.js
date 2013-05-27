var Agent = require('./mechanize/agent');
var Page = require('./mechanize/page');

function newAgent() {
  return new Agent();
}

exports.newAgent = newAgent;
exports.Page = Page;
