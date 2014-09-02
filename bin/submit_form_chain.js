var arguments = process.argv.slice(2);

var Mechanize = require('../lib/mechanize');
var uri = 'http://www.google.com';
if(arguments.length > 0) {
	uri = arguments[0];
}

Mechanize.newAgent().
  get({uri: uri}, function (err, page) {
      // Get the first form from the page (index #0)
      var form = page.form(0);
      // Set the parameter "q" which on the Google page is the search term
      form.setFieldValue("q", "farm");
      form.submit(function(err, page) {
        console.log(page);
      });
  });
