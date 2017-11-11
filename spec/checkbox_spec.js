var Page = require('../lib/mechanize/page.js');

describe('Mechanize/Form/Checkbox', function () {
  var checkbox, form;

  beforeEach(function () {
    var agent, url, response, body, code, page;
    agent = {
      submit: function (form, button, headers, requestOptions, cb) {
        var page = {};
        cb(null, page);
      }
    };
    url = 'form.html';
    response = {};
    body = fixture('form_elements.html');
    code = null;
    page = new Page(url, response, body, code, agent);

    form = page.form('form1');

  });

  context('checked check box', function () {
    beforeEach(function () {
      checkbox = form.checkbox('checkboxChecked');
    });

    it('should be checked', function () {
      checkbox.checked.should.eql(true);
    });
  });

  context('unchecked check box', function () {
    beforeEach(function () {
      checkbox = form.checkbox('checkboxUnchecked');
    });

    it('should not be checked', function () {
      checkbox.checked.should.eql(false);
    });
  });
});
