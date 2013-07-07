var formModule = require('../lib/mechanize/form');
var Page = require('../lib/mechanize/page');
var should = require('should');

describe("Mechanize/Form", function () {
  var form, formSubmitted;

  context("with no action attribute", function () {
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

    it("should have fields", function () {
      form.fields.length.should.equal(3);
    });

    it("should have action", function () {
      form.action.should.equal('form.html');
    });
  });

  context("with action attribute", function () {
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

    it("should have fields", function () {
      form.fields.length.should.equal(4);
    });

    it("should have buttons", function () {
      form.buttons.length.should.equal(1);
    });

    it("should have field", function () {
      var field = form.field('street');
      field.should.exist;
      field.value.should.equal('Main');
    });

    it("should set field value", function () {
      form.setFieldValue('__EVENTTARGET', 'new value');
      form.field('__EVENTTARGET').value.should.equal("new value");
    });

    context("multipart/form-data encoded", function () {
      it("should have requestData", function () {
        var requestData = fixture('multipart_body.txt');
        form.enctype = "multipart/form-data";
        form.requestData().should.equal(requestData);
      });
    });

    it("should have requestData", function () {
      var requestData = fixture('www_form_urlencoded.txt');
      form.requestData().should.equal(requestData);
    });

    it("should submit form", function () {
      form.submit(function (err, page) {
        should.not.exist(err);
        formSubmitted.should.equal(true);
      });
    });

    it("should add button to query", function () {
      var button = {name: 'button'};
      form.addButtonToQuery(button);
      form.clickedButtons.should.eql([button]);
    });

    it("should have action", function () {
      form.action.should.equal('Login.aspx');
    });

    it("should have buildQuery", function () {
      form.buildQuery().should.eql([ [ 'userID', '' ], [ 'name', '' ],
                                     [ 'street', 'Main' ] ]);
    });

    it("should have requestData", function () {
      form.requestData().should.eql("userID=&name=&street=Main");
    });

    context("with deleted field", function () {
      beforeEach(function () {
        form.deleteField('name');
      });

      it("should not include field in buildQuery", function () {
        form.buildQuery().should.eql([ [ 'userID', '' ],
                                       [ 'street', 'Main' ] ]);
      });

    });

    context("with field value that need to be quoted", function () {
      var encoded;
      beforeEach(function () {
        encoded = 'field2=a%3D1%26b%3Dslash%2Fsp+%28paren%29vert%7Csm%3Bcm%2C';
        form.setFieldValue('field2', 'a=1&b=slash/sp (paren)vert|sm;cm,');
      });

      it("should encode", function () {
        form.requestData().should.eql("userID=&name=&street=Main&" + encoded);
      });

    });

  });
});
