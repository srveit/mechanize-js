import { newAgent } from './agent.js'
import { newPage } from './page.js'
import { newButton } from './form/button.js'
import { fixture } from '../../spec/helpers/fixture.js'
import { mockServer } from '../../spec/helpers/mock-server.js'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

describe('Mechanize/Form', () => {
  let server, baseUrl, host, agent, form

  beforeAll(async () => {
    server = mockServer([
      {
        method: 'post',
        path: '/',
        name: 'postForm',
      },
    ])
    await server.start()
  })
  afterAll(() => server.stop())
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL
    host = process.env.SERVER_HOST
    agent = newAgent()
  })
  describe('with no action attribute', () => {
    beforeEach(async () => {
      const uri = 'form.html'
      const body = await fixture('login_no_action.html')
      const page = newPage({
        uri,
        body,
      })

      form = page.form('login')
    })

    it('should have field', () => {
      expect(form.field('login_password')).toEqual(
        expect.objectContaining({
          name: 'login_password',
          fieldType: 'field',
        })
      )
    })

    it('should have null action', () => {
      expect(form.action).toBe(null)
    })
  })
  describe('with hidden field', () => {
    beforeEach(async () => {
      const uri = baseUrl
      const body = await fixture('form_with_amp.html')
      const page = newPage({
        uri,
        body,
        agent,
      })

      form = page.form('hiddenform')
    })

    it('should have field', () => {
      expect(form.field('field2')).toEqual(
        expect.objectContaining({
          name: 'field2',
          fieldType: 'hidden',
        })
      )
    })

    it('should have correct value', () => {
      expect(form.fieldValue('field2')).toBe(
        '<Response Context="rm=0&amp;id=passive">'
      )
    })
  })

  describe('with action attribute', () => {
    beforeEach(async () => {
      const uri = baseUrl
      const body = await fixture('login.html')
      const page = newPage({
        uri,
        body,
        agent,
      })

      form = page.form('MAINFORM')
    })

    it('should have field', () => {
      expect(form.field('street')).toEqual(
        expect.objectContaining({
          name: 'street',
          fieldType: 'hidden',
        })
      )
    })

    it('should have button', () => {
      expect(form.submitButton()).toEqual(
        expect.objectContaining({
          name: 'signon',
          fieldType: 'submit',
        })
      )
    })

    it('should have multipart requestData', async () => {
      const requestData = await fixture('multipart_body.txt')
      expect(form.requestData('multipart/form-data')).toBe(requestData)
    })

    it('should have URL encoded requestData', async () => {
      const requestData = await fixture('www_form_urlencoded.txt')
      expect(form.requestData()).toBe(requestData)
    })

    it('should have plain requestData', async () => {
      const requestData = await fixture('mainform_text_plain.txt')
      expect(form.requestData('text/plain')).toBe(requestData)
    })

    it('should have action', () => {
      expect(form.action).toBe('Login.aspx')
    })

    it('should have buildQuery', () => {
      expect(form.buildQuery()).toEqual([
        ['userID', ''],
        ['name', ''],
        ['street', 'Main'],
      ])
    })

    it('should have requestData', () => {
      expect(form.requestData()).toBe('userID=&name=&street=Main')
    })

    describe('and adding button to query', () => {
      beforeEach(() => {
        const button = newButton({
          name: 'button',
        })
        form.addButtonToQuery(button)
      })
      it('should add button to requestData', async () => {
        const requestData = await fixture('www_form_urlencoded_with_button.txt')
        expect(form.requestData()).toBe(requestData)
      })
    })

    describe('and setting field value', () => {
      let newValue
      beforeEach(() => {
        newValue = 'new value'
        form.setFieldValue('__EVENTTARGET', newValue)
      })

      it('should set field value', () => {
        expect(form.field('__EVENTTARGET').value()).toBe(newValue)
      })

      it('should get field value using fieldValue', () => {
        expect(form.fieldValue('__EVENTTARGET')).toBe(newValue)
      })
    })

    describe('then submitting form', () => {
      beforeEach(async () => {
        await form.submit()
      })
      it('should post the form', () => {
        expect(server.postForm).toHaveBeenCalledWith({
          path: '/Login.aspx',
          headers: {
            accept: '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': '25',
            host,
            origin: expect.stringMatching(/localhost:[0-9]+/),
            pragma: 'no-cache',
            referer: baseUrl + '/',
            'user-agent': expect.stringMatching(
              /Mechanize\/[.0-9]+ Node.js\/v[.0-9]+ \(http:\/\/github.com\/srveit\/mechanize-js\/\)/
            ),
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

    describe('with deleted field', () => {
      beforeEach(() => {
        form.deleteField('name')
      })

      it('should not include field in buildQuery', () => {
        expect(form.buildQuery()).toEqual([
          ['userID', ''],
          ['street', 'Main'],
        ])
      })
    })

    describe('with field value that need to be quoted', () => {
      let encoded
      beforeEach(() => {
        encoded = 'field2=a%3D1%26b%3Dslash%2Fsp+%28paren%29vert%7Csm%3Bcm%2C'
        form.setFieldValue('field2', 'a=1&b=slash/sp (paren)vert|sm;cm,')
      })

      it('should encode', () => {
        expect(form.requestData()).toBe('userID=&name=&street=Main&' + encoded)
      })
    })

    describe('with field value that has &amp;', () => {
      let encoded
      beforeEach(() => {
        encoded =
          'field2=%26lt%3BResponse+Context%3D%26quot%3Brm%3D0%26amp%3Bamp%3Bid%3Dpassive%26quot%3B%3E'
        form.setFieldValue(
          'field2',
          '&lt;Response Context=&quot;rm=0&amp;amp;id=passive&quot;>'
        )
      })

      it('should set the field value', () => {
        expect(form.fieldValue('field2')).toBe(
          '&lt;Response Context=&quot;rm=0&amp;amp;id=passive&quot;>'
        )
      })

      it('should encode', () => {
        expect(form.requestData('application/x-www-form-urlencoded')).toBe(
          'userID=&name=&street=Main&' + encoded
        )
      })
    })
  })

  describe('with text/plain encoding', () => {
    beforeEach(async () => {
      const uri = null
      const body = await fixture('form_text_plain.html')
      const page = newPage({
        uri,
        body,
      })

      form = page.form('form1')
      form.setFieldValue('text', 'hello')
    })

    it('should have field', () => {
      expect(form.field('text')).toEqual(
        expect.objectContaining({
          name: 'text',
          fieldType: 'text',
        })
      )
    })

    it('should have submit button', () => {
      expect(form.submitButton()).toEqual(
        expect.objectContaining({
          name: '',
          type: 'submit',
          fieldType: 'submit',
        })
      )
    })

    it('should have requestData', async () => {
      const requestData = await fixture('text_plain.txt')
      expect(form.requestData('text/plain')).toBe(requestData)
    })
  })
})
