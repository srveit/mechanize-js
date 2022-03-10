'use strict'
const { newAgent } = require('./mechanize/agent')
const { newPage } = require('./mechanize/page')
const { newLink } = require('./mechanize/page/link')

module.exports = {
  newAgent,
  newPage,
  newLink,
}
