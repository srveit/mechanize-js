'use strict';
const mechanize = require('../lib/mechanize'),
  args = process.argv.slice(2);

let uri = 'http://www.google.com';
if(args.length > 0) {
  uri = args[0];
}

mechanize.newAgent()
  .get({uri})
  .then(page => {
    // Get the first form from the page (index #0)
    const form = page.form(0);
    // Set the parameter "q" which on the Google page is the search term
    form.setFieldValue("q", "farm");
    return form.submit({});
  })
  .then(page => console.log(page))
  .catch(error => console.error(error));
