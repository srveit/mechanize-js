var Page = require('../lib/mechanize/page.js');
var should = require('should');


describe("Mechanize/Form/Text", function () {
  var text, form;

  beforeEach(function () {
    var agent, url, response, body, code, page;
    agent = {
      submit: function (form, button, headers, requestOptions, fn) {
        var page = {};
        fn(null, page);
      }
    };
    url = 'form.html';
    response = {};
    body = fixture('form_elements.html');
    code = null;
    page = new Page(url, response, body, code, agent);

    form = page.form('form1');

  });

  context("text field", function () {
    beforeEach(function () {
      text = form.field("text");
    });

    it("should not be disabled", function () {
      text.disabled.should.eql(false);
    });
  });

  context("disabled text field", function () {
    beforeEach(function () {
      text = form.field("textDisabled");
    });

    it("should be disabled", function () {
      text.disabled.should.eql(true);
    });
  });
});
