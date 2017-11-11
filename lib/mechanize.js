'use strict';
const {newAgent} = require('./mechanize/agent'),
  {newPage} = require('./mechanize/page');

exports.newAgent = newAgent;
exports.newPage = newPage;
