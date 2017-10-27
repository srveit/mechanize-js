const fs = require('fs');

global.fixture = filename =>
  fs.readFileSync(__dirname + '/fixtures/' + filename, 'utf8');
global.context = describe;
