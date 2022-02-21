#!/usr/bin/env node
'use strict';
const args = process.argv.slice(2),
  {newAgent} = require('../lib/mechanize'),

  showPageLinks = async uri => {
    const agent = newAgent(),
      page = await agent.get({
        uri
      }),
      links = page.links();

    for (const link of links) {
      console.log(link.href, link.domId, link.domClass);
    }
  };

showPageLinks(args[0] || 'http://www.google.com');

