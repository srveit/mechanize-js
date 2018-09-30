#!/usr/bin/env node
'use strict';

const {newAgent} = require('../lib/mechanize'),
  {Cookie} = require('cookiejar'),
  args = process.argv.slice(2),

  submitExample = async url => {
    const agent = newAgent(),
      cookie = new Cookie("sessionid=123;domain=.example.com;path=/"),
      username = "MYUSERNAME",
      password = "MYPASSWORD",
      requestData = 'username='+username+'&password='+password,
      form = {
        page: {uri: url},
        action: 'login',
        method: 'POST',
        enctype: 'application/x-www-form-urlencoded',
        requestData: () => {
          return requestData;
        },
        addButtonToQuery: () => {}
      };

    agent.setCookie(cookie);

    const page = await agent.submit({form});
    console.log(page);
  };

submitExample(args[0] || "http://example.com/");
