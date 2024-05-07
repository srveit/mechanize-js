#!/usr/bin/env node
import { newAgent } from '../lib/mechanize.js'
const args = process.argv.slice(2)
const baseUri = new URL('https://www-us.computershare.com/')

const getRequestVerificationToken = async () => {
  const uri = new URL('Investor/#Home', baseUri)
  const agent = newAgent()
  agent.setUserAgent('Mac Safari')
  const page = await agent.get({
    redirect: 'manual',
    headers: {
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    uri,
  })
  console.log('page', page.body)
  console.log('responseHeaders', page.responseHeaders)
  console.log('response cookies', await agent.getCookies({domain: 'www-us.computershare.com'}))

  const page2 = await agent.get({
    redirect: 'manual',
    headers: {
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    uri: '/Investor/mobile/tomobile',
  })
  console.log('page2', page2.body)
  console.log(page2.responseHeaders)
  const page3 = await agent.get({
    redirect: 'manual',
    headers: {
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    uri: 'http://www-us.computershare.com/Investor/',
  })
  console.log('page3', page3.body)
  console.log(        page3.responseHeaders)

}

getRequestVerificationToken()
