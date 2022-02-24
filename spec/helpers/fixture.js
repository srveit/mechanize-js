'use strict';

const {readFile} = require('fs/promises'),
  path = require('path'),

  fixture = filename =>
    readFile(path.join(__dirname, '..', 'fixtures/', filename), 'utf8');

exports.fixture = fixture;
