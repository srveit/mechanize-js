'use strict';
const fs = require('fs'),
  {promisify} = require('util'),
  readFile = promisify(fs.readFile),
  path = require('path');

const fixture = filename =>
  readFile(path.join(__dirname, '../fixtures', filename), 'utf8');

exports.fixture = fixture;
