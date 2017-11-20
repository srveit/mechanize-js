#!/usr/bin/env node
'use strict';

const mechanize = require('../lib/mechanize'),
  args = process.argv.slice(2);

let uri = "http://example.com/";

if (args.length > 0) {
  uri = args[0];
}

var agent = mechanize.newAgent();
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
  requestData: () => {
    return requestData;
  },
  addButtonToQuery: () => {}
};

agent.submit({form})
  .then(page => console.log(page))
  .catch(error => console.error(error));
