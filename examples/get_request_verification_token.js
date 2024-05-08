#!/usr/bin/env node
import { newAgent } from '../lib/mechanize.js'
const args = process.argv.slice(2)
const baseUri = new URL('https://www-us.computershare.com/')

const getRequestVerificationToken = async () => {
  const uri = new URL('Investor/#Home', baseUri)
  const agent = newAgent()
  agent.setUserAgent('Mac Safari')
  const page = await agent.get(
    uri,
    {
    redirect: 'manual',
    headers: {
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    
  })
  console.log('page', page.body)
  console.log('responseHeaders', page.responseHeaders)
  console.log(
    'response cookies',
    await agent.getCookies({ domain: 'www-us.computershare.com' })
  )
  return
  const page2 = await agent.get(
    '/Investor/mobile/tomobile',
    {
    redirect: 'manual',
    headers: {
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    
  })
  console.log('page2', page2.body)
  console.log(page2.responseHeaders)
  const page3 = await agent.get(
    'http://www-us.computershare.com/Investor/',
    {
    redirect: 'manual',
    headers: {
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    
  })
  console.log('page3', page3.body)
  console.log(page3.responseHeaders)
}

getRequestVerificationToken()
