const fs = require('fs'),
  path = require('path');

global.fixture = filename =>
  fs.readFileSync(path.join(__dirname, '../fixtures', filename), 'utf8');
global.context = describe;
