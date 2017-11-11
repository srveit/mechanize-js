'use strict';
const {newButton} = require('./form/button'),
  {newCheckbox} = require('./form/checkbox'),
  {newField} = require('./form/field'),
  {newFileUpload} = require('./form/file_upload'),
  {newHidden} = require('./form/hidden'),
  {newImageButton} = require('./form/image_button'),
  {newMultiSelectList} = require('./form/multi_select_list'),
  {newRadioButton} = require('./form/radio_button'),
  {newReset} = require('./form/reset'),
  {newSelectList} = require('./form/select_list'),
  {newSubmit} = require('./form/submit'),
  {newText} = require('./form/text'),
  {newTextarea} = require('./form/textarea'),
  querystring = require('querystring');

exports.newForm = ({page, node}) => {
  const action = querystring.unescape((node.attr('action') &&
                                       node.attr('action').value()) || page.uri),
    method = ((node.attr('method') && node.attr('method').value()) ||
              'GET').toUpperCase(),
    name = node.attr('name') && node.attr('name').value(),
    enctype = (node.attr('enctype') && node.attr('enctype').value()) ||
          'application/x-www-form-urlencoded',
    clickedButtons = [],
    fields = [],
    buttons = [],
    fileUploads = [],
    radiobuttons = [],
    checkboxes = [],

    initializeFields = () => {
      node.find('//input').forEach(input => {
        const type = ((input.attr('type') && input.attr('type').value()) ||
                      'text').toLocaleLowerCase();
        switch (type) {
        case 'radio':
          radiobuttons.push(newRadioButton(form, input));
          break;
        case 'checkbox':
          checkboxes.push(newCheckbox(form, input));
          break;
        case 'file':
          fileUploads.push(newFileUpload(form, input));
          break;
        case 'submit':
          buttons.push(newSubmit(form, input));
          break;
        case 'button':
          buttons.push(newButton(form, input));
          break;
        case 'reset':
          buttons.push(newReset(form, input));
          break;
        case 'image':
          buttons.push(newImageButton(form, input));
          break;
        case 'hidden':
          fields.push(newHidden(form, input));
          break;
        case 'text':
          fields.push(newText(form, input));
          break;
        case 'textarea':
          fields.push(newTextarea(form, input));
          break;
        default:
          fields.push(newField(form, input));
        }
      });

      node.find('//textarea').forEach(textarea => {
        const name = textarea.attr('name') && textarea.attr('name').value();
        if (name) {
          fields.push(newTextarea(form, textarea));
        }
      });

      node.find('//select').forEach(select => {
        const name = select.attr('name') && select.attr('name').value();
        if (name) {
          if (select.attr('multiple')) {
            fields.push(newMultiSelectList(form, select));
          } else {
            fields.push(newSelectList(form, select));
          }
        }
      });

      // FIXME: what can I do with the reset buttons?
      node.find('//button').forEach(button => {
        const type = (button.attr('type') || 'submit').toLowerCase();
        if (type !== 'reset') {
          buttons.push(newButton(form, button));
        }
      });
    },

  form = {};

  initializeFields();

  return Object.freeze(form);
};


function processQuery(form, field) {
  var queryValue = field.queryValue() || [];
  return queryValue.map(function (element) {
    return [form.fromNativeCharset(element[0]),
      form.fromNativeCharset(element[1].toString())];
  });
}

function randomString(size) {           // eslint-disable-line no-unused-vars
  return 'abcdefghjiklmnopqrst';
}

function mimeValueQuote(name) {
  return name.replace(/(["\r\\])/g, function (s) {
    return '\\' + s;
  });
}

function paramToMultipart(name, value) {
  return 'Content-Disposition: form-data; name="' +
    mimeValueQuote(name) + '"\r\n' +
    '\r\n' + value + '\r\n';
}

function fileToMultipart(fileUpload) {      // eslint-disable-line no-unused-vars
  // TODO: implement
}

function urlencode(str) {
  var encoded = encodeURIComponent(str).replace(/!/g, '%21');
  encoded = encoded.replace(/'/g, '%27').replace(/\(/g, '%28');
  encoded = encoded.replace(/\)/g, '%29').replace(/\*/g, '%2A');
  return encoded.replace(/%20/g, '+');
}

function buildQueryString(params) {
  return params.filter(function (param) {
    return param[0];
  }).map(function (param) {
    return param.map(function (nameOrValue) {
      return urlencode(nameOrValue);
    }).join('=');
  }).join('&');
}

Form.prototype.field = function (name) {
  return this.fields.filter(function (f) {
    return f.name === name;
  })[0];
};

Form.prototype.checkbox = function (name) {
  return this.checkboxes.filter(function (f) {
    return f.name === name;
  })[0];
};

Form.prototype.addField = function (name, value) {
  this.fields.push(new Field(this, {name: name, value: value}));
};

Form.prototype.setFieldValue = function (name, value) {
  var f = this.field(name);
  if (f) {
    f.value = value;
  } else {
    this.addField(name, value);
  }
};

Form.prototype.submit = function (button, headers, requestOptions, cb) {
  if (typeof button === 'function') {
    cb = button;
    button = null;
    headers = {};
    requestOptions = {};
  } else if (typeof headers === 'function') {
    cb = headers;
    headers = {};
    requestOptions = {};
  } else if (typeof requestOptions === 'function') {
    cb = requestOptions;
    requestOptions = {};
  }
  this.page.submit(this, button, headers, requestOptions, function (err, page) {
    cb(err, page);
  });
};

Form.prototype.addButtonToQuery = function (button) {
  this.clickedButtons.push(button);
};

Form.prototype.buildQuery = function () {
  var that, query, queryValue, queryFields;
  that = this;
  query = [];
  queryFields = this.fields.concat(this.checkboxes);

  queryFields.forEach(function (field) {
    if ((field.fieldType !== 'checkbox' || field.checked) && !field.disabled) {
      queryValue = processQuery(that, field);
      query = query.concat(queryValue);
    }
  });
  return query;
};

Form.prototype.fromNativeCharset = function (string) {
  return string;
};

Form.prototype.labelFor = function (id) {
  return this.page.labelFor(id);
};

Form.prototype.requestData = function () {
  var queryParams, boundary, params;
  queryParams = this.buildQuery();

  if (this.enctype.match(/^multipart\/form-data/)) {
    boundary = randomString(20);
    this.enctype = 'multipart/form-data; boundary=' + boundary;
    params = [];
    queryParams.forEach(function (queryParam) {
      if (queryParam[0]) {
        params.push(paramToMultipart(queryParam[0], queryParam[1]));
      }
    });
    this.fileUploads.forEach(function (fileUpload) {
      params.push(fileToMultipart(fileUpload));
    });
    return params.map(function (param) {
      return '--' + boundary + '\r\n' + param;
    }).join('') + '--' + boundary + '--\r\n';
  }
  return buildQueryString(queryParams);
};

Form.prototype.deleteField = function (name) {
  this.fields = this.fields.filter(function (field) {
    return field.name !== name;
  });
};

module.exports = Form;
