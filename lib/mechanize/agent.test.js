import { newAgent } from './agent.js'
import { URL } from 'url'
import { fixture } from '../../spec/helpers/fixture.js'
import { mockServer } from '../../spec/helpers/mock-server.js'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

const futureDate = 'Fri, 01 Jan 2123 00:00:00 GMT'

describe('Mechanize/Agent', () => {
  let server, host, domain, baseUrl, agent
  const loginPath = '/Investor/'

  beforeAll(async () => {
    server = mockServer([
      {
        method: 'post',
        path: '/',
        name: 'postForm',
      },
      {
        method: 'get',
        path: '/',
        name: 'getPage',
      },
    ])
    await server.start()
  })
  afterAll(() => server.stop())
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL
    host = process.env.SERVER_HOST
    const url = new URL(baseUrl)
    domain = url.hostname
    agent = newAgent()
  })

  it('should have a userAgent', () =>
    expect(agent.userAgent()).toEqual(expect.any(String)))

  describe('getting JSON', () => {
    let uri
    let response

    beforeEach(() => {
      uri = baseUrl + '/data'
    })

    beforeEach(async () => {
      const responseBody = await fixture('data-list.json')
      server.getPage.mockReturnValueOnce(JSON.parse(responseBody))
      response = await agent.get(uri)
    })

    it('should return an object', async () => {
      expect(response.body).toEqual({
        header: {
          name: 'summary',
        },
        rows: [
          {
            name: 'Bob',
            age: 24,
          },
          {
            name: 'Jane',
            age: 36,
          },
        ],
      })
    })
  })

  describe('getting page', () => {
    let uri

    beforeEach(() => {
      uri = baseUrl + '/page.html'
    })

    describe('with meta cookies', () => {
      beforeEach(async () => {
        const responseBody = await fixture('meta_cookies.html')
        server.getPage.mockReturnValueOnce(responseBody)
        await agent.get(uri)
      })

      it('should set cookies', async () => {
        const cookies = await agent.getCookies({
          domain,
        })
        expect(cookies).toEqual([
          expect.objectContaining({
            key: 'sessionid',
            value: '345',
          }),
          expect.objectContaining({
            key: 'name',
            value: 'jones',
          }),
        ])
      })
    })

    describe('with single header cookie', () => {
      beforeEach(async () => {
        const responseBody = await fixture('login.html')
        const headers = [
          [
            'set-cookie',
            'sessionid=345; path=/; ' +
              `expires=${futureDate}; secure; HttpOnly`,
          ],
        ]

        server.getPage.mockReturnValueOnce({
          headers,
          body: responseBody,
        })
        await agent.get(uri)
      })

      it('should set cookies', async () => {
        const cookies = await agent.getCookies({
          domain,
        })
        expect(cookies).toEqual([
          expect.objectContaining({
            key: 'sessionid',
            value: '345',
          }),
        ])
      })
    })

    describe('with header cookies', () => {
      const aspxanonymous =
        'DGHE9ff0VhQew7ioDGpeak30w_3QpvbJr8Odqd-lwVAxcHjonrJyze2b5GT3AAPwEILvFhov7uXZ-GP-8HzeuR_Zm9McWtSNhMJfS0yFa46-yMjHtjgPYIyUpO4YrGsgyKO1Og2'

      beforeEach(async () => {
        const responseBody = await fixture('login2.html')
        server.getPage.mockClear()
        server.getPage.mockReturnValue({
          headers: [
            [
              'set-cookie',
              `.ASPXANONYMOUS=${aspxanonymous}; expires=${futureDate}; path=/; HttpOnly; SameSite=None; Secure`,
            ],
            [
              'set-cookie',
              'ASP.NET_SessionId=hbw3bnuo01f42caukbc4cb0h; path=/; secure; HttpOnly; SameSite=None',
            ],
            [
              'set-cookie',
              'NSC_JOkyutfxd3igfg1e3uoiv5d4sssp1e3=ffffffff090b3f2245525d5f4f58455e445a4a423660;path=/;secure;httponly',
            ],
          ],
          body: responseBody,
        })
        await agent.get(baseUrl + loginPath)
      })

      it('should call getPage', async () => {
        expect(server.getPage).toBeCalledWith(
          expect.objectContaining({
            path: loginPath,
          })
        )
      })

      it('should set cookies', async () => {
        const cookies = await agent.getCookies({
          domain,
        })
        expect(cookies.length).toEqual(3)
      })
    })

    describe('with referrer', () => {
      const referrer = 'http://example.com/home'
      beforeEach(async () => {
        const responseBody = await fixture('login.html')
        server.getPage.mockReturnValueOnce({
          body: responseBody,
        })
        await agent.get(uri, {
          referrer,
        })
      })

      it('should get page with referrer', async () => {
        expect(server.getPage).toHaveBeenCalledWith({
          body: {},
          headers: {
            accept: '*/*',
            'accept-encoding': 'gzip, deflate, br',
            connection: 'keep-alive',
            host: expect.stringMatching(/localhost:[0-9]+/),
            origin: 'http://example.com',
            referer: 'http://example.com/',
            'user-agent':
              'Mechanize/1.0.0 Node.js/v20.12.2 (http://github.com/srveit/mechanize-js/)',
          },
          path: '/page.html',
          query: {},
        })
      })
    })
  })

  describe('getting page with form', () => {
    let uri, form
    beforeEach(async () => {
      uri = baseUrl + '/page.html'
      const responseBody = await fixture('login.html')
      server.getPage.mockReturnValueOnce(responseBody)
      const page = await agent.get(uri)
      form = page.form('MAINFORM')
    })

    it('should have a form', () => {
      expect(form).toEqual(
        expect.objectContaining({
          action: 'Login.aspx',
          addButtonToQuery: expect.any(Function),
          addField: expect.any(Function),
          buildQuery: expect.any(Function),
          checkbox: expect.any(Function),
          deleteField: expect.any(Function),
          enctype: 'application/x-www-form-urlencoded',
          field: expect.any(Function),
          labelFor: expect.any(Function),
          method: 'post',
          name: 'MAINFORM',
          noValidate: false,
          page: expect.any(Object),
          requestData: expect.any(Function),
          setFieldValue: expect.any(Function),
          submit: expect.any(Function),
          target: null,
        })
      )
    })

    describe('then submitting form', () => {
      beforeEach(async () => {
        await agent.setCookie(`sessionid=1234;domain=${domain};path=/`, uri)
        await agent.setCookie('name=bob', uri)
        await agent.submit({
          form,
        })
      })

      it('should post the form', () => {
        expect(server.postForm).toHaveBeenCalledWith({
          path: '/Login.aspx',
          headers: {
            'user-agent': expect.stringMatching(
              /Mechanize\/[.0-9]+ Node.js\/v[.0-9]+ \(http:\/\/github.com\/srveit\/mechanize-js\/\)/
            ),
            accept: '*/*',
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': '25',
            referer: baseUrl + '/page.html',
            origin: baseUrl,
            'accept-encoding': 'gzip, deflate, br',
            cookie: 'sessionid=1234; name=bob',
            host,
            connection: 'keep-alive',
          },
          query: {},
          body: {
            userID: '',
            name: '',
            street: 'Main',
          },
        })
      })
    })
  })
})
