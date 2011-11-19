var Mechanize = require('../lib/mechanize');

Mechanize.newAgent().
  get({uri: 'http://www.google.com'}, function (err, page) {
    console.log(page);
  });
