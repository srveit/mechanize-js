'use strict';
const mechanize = require('../lib/mechanize'),
  args = process.argv.slice(2),
  uri = 'https://twitter.com/login';

if (args.length < 2) {
  console.error("Missing username and password");
  process.exit(1);
}

const [username, password] = args,
  myAgent = mechanize.newAgent();

myAgent
  .get({uri})
  .then(page => {
    // Get the second form from the page (index #1)
    const form = page.form(1),
      token = form.field("authenticity_token").value,
      uniques = {},
      valid = {
        "session[username_or_email]" : 1,
        "session[password]" : 1,
        "authenticity_token" : 1,
        "scribe_log" : 1,
        "redirect_after_login" : 1,
        "remember_me" : 1
      };

    form.setFieldValue("session[username_or_email]", username);
    form.setFieldValue("session[password]", password);

    // The form includes duplicate fields and fields that Twitter doesn't like (generates a 400 bad request)
    // This loop strips fields that Twitter doesn't use
    for(var i in form.fields) {
      if(form.fields[i].name in uniques || !(form.fields[i].name in valid)) {
        // Remove unused field
        form.fields.splice(i, 1);
        continue;
      } else {
        uniques[form.fields[i].name] = 1;
      }
      console.log("Field: " + form.fields[i].name + ":" + form.fields[i].value);
    }
    
    // Once authenticated, Twitter redirects to the home page, so follow redirects
    form.submit(null, {}, {followAllRedirects: true})
      .then(page => {
        console.log("Login Success");
        // Now that we're logged in, access a page specific to a logged in user
        myAgent.get({uri: "https://twitter.com/i/notifications"})
          .then(page => console.log(page);
      });
  });
