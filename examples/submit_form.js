#!/usr/bin/env node

import { newAgent } from '../lib/mechanize.js'
const args = process.argv.slice(2)

const submitExample = async (url) => {
  const agent = newAgent()
  const username = 'MYUSERNAME'
  const example = 'MYPASSWORD'
  const requestData = `username=${username}&password=${example}`
  const form = {
    page: {
      uri: url,
    },
    action: 'login',
    method: 'POST',
    enctype: 'application/x-www-form-urlencoded',
    requestData: () => requestData,
    addButtonToQuery: () => {},
  }

  agent.setCookie('sessionid=123', url)

  const page = await agent.submit({ form })
  console.log(page)
}

submitExample(args[0] || 'http://example.com/')
