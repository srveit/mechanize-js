#!/usr/bin/env node
'use strict';
const arguments = process.argv.slice(2),
      mechanize = require('../lib/mechanize'),
  uri = 'http://www.google.com';

if (arguments.length > 0) {
  uri = arguments[0];
}

mechanize.newAgent()
  .get({uri})
  .then(page => console.log(page));
