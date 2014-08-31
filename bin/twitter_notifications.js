var arguments = process.argv.slice(2);

var Mechanize = require('../lib/mechanize');
var uri = 'https://twitter.com/login';
if(arguments.length > 0) {
	username = arguments[0];
	password = arguments[1];
} else {
	console.log("Missing username and password");
	return;
}

var myAgent = Mechanize.newAgent();
myAgent.
  get({uri: uri}, function (err, page) {
      var form = page.form(1);
      		var token = form.field("authenticity_token").value;
	      form.setFieldValue("session[username_or_email]", username);
	      form.setFieldValue("session[password]", password);
 		  //console.log(form.fields);
 		  uniques = {};
 		  valid = {
 		  	 "session[username_or_email]" : 1,
 		  	 "session[password]" : 1,
 		  	 "authenticity_token" : 1,
 		  	 "scribe_log" : 1,
 		  	 "redirect_after_login" : 1,
 		  	 "remember_me" : 1
 		  };
 		  for(var i in form.fields) {
 		  	  if(form.fields[i].name in uniques || !(form.fields[i].name in valid)) {
 		  	  	  //delete form.fields[i];
 		  	  	  form.fields.splice(i, 1);
 		  	  	  continue;
 		  	  } else {
 		  	  	  uniques[form.fields[i].name] = 1;
 		  	  	 }
 		  	console.log(form.fields[i].name + ":" + form.fields[i].value);
 		  }
			  console.log(form.fields.length);
 		  //console.log(form.fields);
      // Get the first form from the page (index #0)
      // Set the parameter "q" which on the Google page is the search term
        myAgent.get({uri: "https://twitter.com/i/notifications"}, function (err, page) {
        	console.log(page);
        });
      });
  });
