var Agent = require('./mechanize/agent'),

newAgent = function () {
  return new Agent();
};

exports.newAgent = newAgent;
