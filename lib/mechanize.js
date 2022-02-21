'use strict';
const {newAgent} = require('./mechanize/agent'),
  {newPage} = require('./mechanize/page'),
  {newLink} = require('./mechanize/page/link');

module.exports = {
  newAgent,
  newPage,
  newLink
};
