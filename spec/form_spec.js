var formModule = require('../lib/mechanize/form'),
Page = require('../lib/mechanize/page'),
should = require('../../should/lib/should');


describe("Mechanize/Form", function () {
  var form,
  formSubmitted;

  context("with no action attribute", function () {
    beforeEach(function () {
      var agent = {
        submit: function (form, button, headers, fn) {
          var page = {};
          formSubmitted = true;
          fn(null, page);
        }
      },
      url = 'form.html',
      response = {},
      body = fixture('login_no_action.html'),
      code = null,
      page = new Page(agent, url, response, body, code);

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
      var agent = {
        submit: function (form, button, headers, fn) {
          var page = {};
          formSubmitted = true;
          fn(null, page);
        }
      },
      url = null,
      response = {},
      body = fixture('login.html'),
      code = null,
      page = new Page(agent, url, response, body, code);

      form = page.form('MAINFORM');
      formSubmitted = false;
    });

    it("should have fields", function () {
      form.fields.length.should.equal(10);
    });

    it("should have buttons", function () {
      form.buttons.length.should.equal(1);
    });

    it("should have field", function () {
      var field = form.field('__EVENTTARGET');
      field.should.exist;
      field.value.should.equal('btnValidateSignon');
    });

    it("should set field value", function () {
      form.setFieldValue('__EVENTTARGET', 'new value');
      form.field('__EVENTTARGET').value.should.equal("new value");
    });

    it("should have requestData", function () {
      var requestData = fixture('multipart_body.txt');
      form.enctype = "multipart/form-data";
      form.requestData().should.equal(requestData);
    });

    it("should have requestData", function () {
      var requestData = fixture('www_form_urlencoded.txt');
      form.requestData().should.equal(requestData);
    });

    it("should submit form", function () {
      form.submit(function (err, page) {
        should.not.exist(err);
        asyncSpecDone();
      });
      if (!formSubmitted) {
        asyncSpecWait();
      }
      formSubmitted.should.equal(true);
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
      form.buildQuery().should.eql([ [ '__EVENTTARGET', 'btnValidateSignon' ], [ '__VIEWSTATE', 'h85Q5jdm' ], [ 'txtUserID', '' ], [ 'fp_browser', '' ], [ 'fp_screen', '' ], [ 'fp_software', '' ], [ 'fp_timezone', '' ], [ 'fp_language', '' ], [ 'pm_fp', '' ], [ 'TestJavaScript', '' ] ]);
    });
  });
});
