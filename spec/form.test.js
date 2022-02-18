'use strict';
const  {URL} = require('url'),
  {newAgent} = require('../lib/mechanize/agent'),
  {newPage} = require('../lib/mechanize/page'),
  {newButton} = require('../lib/mechanize/form/button'),
  {fixture} = require('./helpers/fixture.js'),
  {mockServer} = require('./helpers/mock_server.js');

describe('Mechanize/Form', () => {
  let server, baseUrl, host, domain, agent, form;

  beforeAll(done => {
    server = mockServer();
    server.start(done);
  });
  afterAll(done => server.stop(done));
  beforeEach(() => {
    baseUrl = process.env.SERVER_BASE_URL;
    host = process.env.SERVER_HOST;
    const url = new URL(baseUrl);
    domain = url.hostname;
    agent = newAgent();
  });
  describe('with no action attribute', () => {
    beforeEach(() => {
      let uri, body, page;
      uri = 'form.html';
      body = fixture('login_no_action.html');
      page = newPage({uri, body});

      form = page.form('login');
    });

    it('should have field', () => {
      expect(form.field('login_password')).toEqual(jasmine.objectContaining({
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
      let uri, body, page;
      uri = baseUrl;
      body = fixture('login.html');
      page = newPage({uri, body, agent});

      form = page.form('MAINFORM');
    });

    it('should have field', () => {
      expect(form.field('street')).toEqual(jasmine.objectContaining({
        name: 'street',
        fieldType: 'hidden'
      }));
    });

    it('should have button', () => {
      expect(form.submitButton()).toEqual(jasmine.objectContaining({
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
      const requestData = fixture('mainform_text_plain.txt');
      expect(form.requestData('text/plain')).toBe(requestData);
    });

    it('should have action', () => {
      expect(form.action).toBe('Login.aspx');
    });

    it('should have buildQuery', () => {
      expect(form.buildQuery()).toEqual([ [ 'userID', '' ], [ 'name', '' ],
        [ 'street', 'Main' ] ]);
    });

    it('should have requestData', () => {
      expect(form.requestData()).toBe('userID=&name=&street=Main');
    });

    describe('and adding button to query', () => {
      beforeEach(() => {
        const button = newButton({name: 'button'});
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
      let submitPage, submitError;
      beforeEach(done => {
        server.postForm.calls.reset();
        form.submit({})
          .then(page => submitPage = page)
          .catch(error => submitError = error)
          .then(() => done());
      });
      it('should post the form', () => {
        expect(server.postForm).toHaveBeenCalledWith({
          path: '/Login.aspx',
          headers: {
            'user-agent': jasmine.stringMatching(
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
        expect(form.buildQuery()).toEqual([ [ 'userID', '' ],
          [ 'street', 'Main' ] ]);
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
        page = newPage({uri, body});

      form = page.form('form1');
      form.setFieldValue('text', 'hello');
    });

    it('should have field', () => {
      expect(form.field('text')).toEqual(jasmine.objectContaining({
        name: 'text',
        fieldType: 'text'
      }));
    });

    it('should have submit button', () => {
      expect(form.submitButton()).toEqual(jasmine.objectContaining({
        name: '',
        type: 'submit',
        fieldType: 'submit'
      }));
    });

    it('should have requestData', () => {
      const requestData = fixture('text_plain.txt');
      expect(form.requestData('text/plain')).toBe(requestData);
    });

  });
});
