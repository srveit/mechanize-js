var Agent = require('./mechanize/agent'),
Page = require('./mechanize/page'),

newAgent = function () {
  return new Agent();
};

exports.newAgent = newAgent;
exports.Page = Page;
