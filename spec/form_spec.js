var Page = require('../lib/mechanize/page');
var should = require('should');

describe('Mechanize/Form', function () {
  var form, formSubmitted;

  context('with no action attribute', function () {
    beforeEach(function () {
      var agent, url, response, body, code, page;
      agent = {
        submit: function (form, button, headers, requestOptions, cb) {
          var page = {};
          formSubmitted = true;
          cb(null, page);
        }
      };
      url = 'form.html';
      response = {};
      body = fixture('login_no_action.html');
      code = null;
      page = new Page(url, response, body, code, agent);

      form = page.form('login');
      formSubmitted = false;
    });

    it('should have fields', function () {
      expect(form.fields.length).toBe(3);
    });

    it('should have action', function () {
      expect(form.action).toBe('form.html');
    });
  });

  context('with action attribute', function () {
    beforeEach(function () {
      var agent, url, response, body, code, page;
      agent = {
        submit: function (form, button, headers, requestOptions, cb) {
          var page = {};
          formSubmitted = true;
          cb(null, page);
        }
      };
      url = null;
      response = {};
      body = fixture('login.html');
      code = null;
      page = new Page(url, response, body, code, agent);

      form = page.form('MAINFORM');
      formSubmitted = false;
    });

    it('should have fields', function () {
      expect(form.fields.length).toBe(4);
    });

    it('should have buttons', function () {
      expect(form.buttons.length).toBe(1);
    });

    it('should have field', function () {
      var field = form.field('street');
      expect(field).not.toBe(undefined);
      expect(field.value).toBe('Main');
    });

    it('should set field value', function () {
      form.setFieldValue('__EVENTTARGET', 'new value');
      expect(form.field('__EVENTTARGET').value).toBe('new value');
    });

    context('multipart/form-data encoded', function () {
      it('should have requestData', function () {
        var requestData = fixture('multipart_body.txt');
        form.enctype = 'multipart/form-data';
        expect(form.requestData()).toBe(requestData);
      });
    });

    it('should have requestData', function () {
      var requestData = fixture('www_form_urlencoded.txt');
      expect(form.requestData()).toBe(requestData);
    });

    it('should submit form', function () {
      form.submit(function (err, page) {
        expect(err).toBe(undefined);
        expect(formSubmitted).toBe(true);
      });
    });

    it('should add button to query', function () {
      var button = {name: 'button'};
      form.addButtonToQuery(button);
      expect(form.clickedButtons).toEqual([button]);
    });

    it('should have action', function () {
      expect(form.action).toBe('Login.aspx');
    });

    it('should have buildQuery', function () {
      expect(form.buildQuery()).toEqual([ [ 'userID', '' ], [ 'name', '' ],
        [ 'street', 'Main' ] ]);
    });

    it('should have requestData', function () {
      expect(form.requestData()).toBe('userID=&name=&street=Main');
    });

    context('with deleted field', function () {
      beforeEach(function () {
        form.deleteField('name');
      });

      it('should not include field in buildQuery', function () {
        expect(form.buildQuery()).toEqual([ [ 'userID', '' ],
          [ 'street', 'Main' ] ]);
      });

    });

    context('with field value that need to be quoted', function () {
      var encoded;
      beforeEach(function () {
        encoded = 'field2=a%3D1%26b%3Dslash%2Fsp+%28paren%29vert%7Csm%3Bcm%2C';
        form.setFieldValue('field2', 'a=1&b=slash/sp (paren)vert|sm;cm,');
      });

      it('should encode', function () {
        expect(form.requestData()).toBe('userID=&name=&street=Main&' + encoded);
      });

    });

  });
});
