import { newAgent } from '../lib/mechanize.js'
const args = process.argv.slice(2)

const submitFormChain = async (url) => {
  const agent = newAgent()
  const page = await agent.get({ uri: url })
  // get the first form from the page (index #0)
  const form = page.form(0)

  // set the parameter "q" which on the Google page is the search term
  form.setFieldValue('q', 'farm')
  const secondPage = await form.submit({})
  console.log(secondPage)
}

submitFormChain(args[0] || 'http://www.google.com')
