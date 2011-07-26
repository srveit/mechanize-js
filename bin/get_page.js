var Mechanize = require('../lib/mechanize');

Mechanize.newAgent().
  get({uri: 'http://www.google.com'}, function (err, page) {
    //console.log(require('sys').inspect(page));
    console.log(require('sys').inspect(page.response.headers['content-type']));
    console.log(page.responseHeaderCharset);
  });
