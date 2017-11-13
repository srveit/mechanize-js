#!/usr/bin/env node
'use strict';
const args = process.argv.slice(2),
      mechanize = require('../lib/mechanize');
let uri = 'http://www.google.com';

if (args.length > 0) {
  uri = args[0];
}

mechanize.newAgent()
  .get({uri})
  .then(page => console.log(page.links()));
