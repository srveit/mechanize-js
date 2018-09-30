'use strict';
const {newAgent} = require('../lib/mechanize'),
  args = process.argv.slice(2),

  submitFormChain = async url => {
    const agent = newAgent(),
      page = await agent.get({uri: url}),
      // Get the first form from the page (index #0)
      form = page.form(0);

    // Set the parameter "q" which on the Google page is the search term
    form.setFieldValue("q", "farm");
    const secondPage = await form.submit({});
    console.log(page);
  };

submitFormChain(args[0] || 'http://www.google.com');
