'use strict'

const { readFile } = require('fs/promises')
const path = require('path')

const fixture = filename =>
  readFile(path.join(__dirname, '..', 'fixtures/', filename), 'utf8')

exports.fixture = fixture
