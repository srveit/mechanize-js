#!/usr/bin/env node
import { newAgent } from '../lib/mechanize.js'
const args = process.argv.slice(2)

const showPageLinks = async (uri) => {
  const agent = newAgent()
  const page = await agent.get(uri)
  const links = page.links()

  for (const link of links) {
    console.log(link.href, link.domId, link.domClass)
  }
}

showPageLinks(args[0] || 'http://www.google.com')
