'use strict'

import * as path from 'path'
import { readFile } from 'fs/promises'

const fixture = filename =>
  readFile(path.join(__dirname, '..', 'fixtures/', filename), 'utf8')

exports.fixture = fixture
