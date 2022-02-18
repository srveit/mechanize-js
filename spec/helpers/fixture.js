'use strict';
const fs = require('fs'),
  path = require('path');

const fixture = filename =>
 // eslint-disable-next-line no-sync
 fs.readFileSync(path.join(__dirname, '../fixtures', filename), 'utf8');


exports.fixture = fixture;
