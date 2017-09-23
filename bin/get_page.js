#!/usr/bin/env node
'use strict';

const mechanize = require('../lib/mechanize'),
  args = process.argv.slice(2);

let uri = 'http://www.google.com';

if(args.length > 0) {
  uri = args[0];
}

mechanize.newAgent().
  get({uri: uri}, function (err, page) {
    console.log(page);
  });
