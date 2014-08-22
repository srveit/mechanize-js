var Mechanize = require('../lib/mechanize');

var uri = "http://example.com/";

var arguments = process.argv.slice(2);
if(arguments.length > 0) {
	uri = arguments[0];
}

var agent = Mechanize.newAgent();
cookie = new Cookie("sessionid=123;domain=.example.com;path=/");
agent.cookieJar.setCookie(cookie);

var username = "MYUSERNAME";
var password = "MYPASSWORD";
var requestData = 'username='+username+'&password='+password;

var form = {
  page: {uri: uri},
  action: 'login',
  method: 'POST',
  enctype: 'application/x-www-form-urlencoded',
  requestData: function () {
    return requestData;
  },
  addButtonToQuery: function () {}
};

agent.submit(form, null, {}, {}, function (err, page) {
  submitErr = err;
  submitPage = page;
  console.log(page);
});
