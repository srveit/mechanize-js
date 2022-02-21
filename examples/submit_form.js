#!/usr/bin/env node
'use strict';

const {newAgent} = require('../lib/mechanize'),
  args = process.argv.slice(2),

  submitExample = async url => {
    const agent = newAgent(),
      username = "MYUSERNAME",
      example = "MYPASSWORD",
      requestData = `username=${username}&password=${example}`,
      form = {
        page: {
          uri: url
        },
        action: 'login',
        method: 'POST',
        enctype: 'application/x-www-form-urlencoded',
        requestData: () => requestData,
        addButtonToQuery: () => {}
      };

    agent.setCookie('sessionid=123', url);

    const page = await agent.submit({form});
    console.log(page);
  };

submitExample(args[0] || "http://example.com/");
