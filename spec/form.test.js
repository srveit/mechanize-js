'use strict';
const {newAgent} = require('../lib/mechanize/agent'),
  {newPage} = require('../lib/mechanize/page'),
  {newButton} = require('../lib/mechanize/form/button'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock-server.js');

describe('Mechanize/Form', () => {
  let server, baseUrl, host, agent, form;

  beforeAll(async () => {
    server = mockServer([
      {
        method: 'post',
        path: '/',
        name: 'postForm'
      }
    ]);
    await server.start();
  });
  afterAll(() => server.stop());
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL;
    host = process.env.SERVER_HOST;
    agent = newAgent();
  });
  describe('with no action attribute', () => {
    beforeEach(() => {
      const uri = 'form.html';
      const body = fixture('login_no_action.html');
      const page = newPage({
        uri, body
      });

      form = page.form('login');
    });

    it('should have field', () => {
      expect(form.field('login_password')).toEqual(expect.objectContaining({
        name: 'login_password',
        fieldType: 'field'
      }));
    });

    it('should have null action', () => {
      expect(form.action).toBe(null);
    });
  });

  describe('with action attribute', () => {
    beforeEach(() => {
      const uri = baseUrl;
      const body = fixture('login.html');
      const page = newPage({
        uri, body, agent
      });

      form = page.form('MAINFORM');
    });

    it('should have field', () => {
      expect(form.field('street')).toEqual(expect.objectContaining({
        name: 'street',
        fieldType: 'hidden'
      }));
    });

    it('should have button', () => {
      expect(form.submitButton()).toEqual(expect.objectContaining({
        name: 'signon',
        fieldType: 'submit'
      }));
    });

    it('should have multipart requestData', () => {
      const requestData = fixture('multipart_body.txt');
      expect(form.requestData('multipart/form-data')).toBe(requestData);
    });

    it('should have URL encoded requestData', () => {
      const requestData = fixture('www_form_urlencoded.txt');
      expect(form.requestData()).toBe(requestData);
    });

    it('should have plain requestData', () => {
      const requestData = fixture('mainform_text_plain.txt')
        .replaceAll(/\r\n/gm, '\n');
      // eslint-disable-next-line no-console
      console.log('A requestData', requestData.length, 'form.requestData', form.requestData('text/plain').length);
      expect(form.requestData('text/plain')).toBe(requestData);
    });

    it('should have action', () => {
      expect(form.action).toBe('Login.aspx');
    });

    it('should have buildQuery', () => {
      expect(form.buildQuery()).toEqual([
        ['userID', ''], ['name', ''],
        ['street', 'Main']
      ]);
    });

    it('should have requestData', () => {
      expect(form.requestData()).toBe('userID=&name=&street=Main');
    });

    describe('and adding button to query', () => {
      beforeEach(() => {
        const button = newButton({
          name: 'button'
        });
        form.addButtonToQuery(button);
      });
      it('should add button to requestData', () => {
        const requestData = fixture('www_form_urlencoded_with_button.txt');
        expect(form.requestData()).toBe(requestData);
      });
    });

    describe('and setting field value', () => {
      let newValue;
      beforeEach(() => {
        newValue = 'new value';
        form.setFieldValue('__EVENTTARGET', newValue);
      });

      it('should set field value', () => {
        expect(form.field('__EVENTTARGET').value()).toBe(newValue);
      });

      it('should get field value using fieldValue', () => {
        expect(form.fieldValue('__EVENTTARGET')).toBe(newValue);
      });
    });

    describe('then submitting form', () => {
      beforeEach(async () => {
        await form.submit({});
      });
      it('should post the form', () => {
        expect(server.postForm).toHaveBeenCalledWith({
          path: '/Login.aspx',
          headers: {
            'user-agent': expect.stringMatching(
              /Mechanize\/[.0-9]+ Node.js\/v[.0-9]+ \(http:\/\/github.com\/srveit\/mechanize-js\/\)/),
            accept: '*/*',
            'accept-encoding': 'gzip,deflate',
            'content-type': 'application/x-www-form-urlencoded',
            'content-length': '25',
            referer: baseUrl,
            origin: baseUrl,
            host: host,
            connection: 'close'
          },
          query: {},
          body: {
            userID: '',
            name: '',
            street: 'Main'
          }
        });
      });
    });

    describe('with deleted field', () => {
      beforeEach(() => {
        form.deleteField('name');
      });

      it('should not include field in buildQuery', () => {
        expect(form.buildQuery()).toEqual([
          ['userID', ''],
          ['street', 'Main']
        ]);
      });

    });

    describe('with field value that need to be quoted', () => {
      let encoded;
      beforeEach(() => {
        encoded = 'field2=a%3D1%26b%3Dslash%2Fsp+%28paren%29vert%7Csm%3Bcm%2C';
        form.setFieldValue('field2', 'a=1&b=slash/sp (paren)vert|sm;cm,');
      });

      it('should encode', () => {
        expect(form.requestData()).toBe('userID=&name=&street=Main&' + encoded);
      });

    });

  });

  describe('with text/plain encoding', () => {
    beforeEach(() => {
      const uri = null,
        body = fixture('form_text_plain.html'),
        page = newPage({
          uri, body
        });

      form = page.form('form1');
      form.setFieldValue('text', 'hello');
    });

    it('should have field', () => {
      expect(form.field('text')).toEqual(expect.objectContaining({
        name: 'text',
        fieldType: 'text'
      }));
    });

    it('should have submit button', () => {
      expect(form.submitButton()).toEqual(expect.objectContaining({
        name: '',
        type: 'submit',
        fieldType: 'submit'
      }));
    });

    it('should have requestData', () => {
      const requestData = fixture('text_plain.txt')
        .replaceAll(/\r\n/gm, '\n');
      // eslint-disable-next-line no-console
      console.log('B requestData', requestData.length, 'form.requestData', form.requestData('text/plain').length);
      expect(form.requestData('text/plain')).toBe(requestData);
    });

  });
});
