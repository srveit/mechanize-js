var Button = require('./form/button');
var CheckBox = require('./form/check_box');
var Field = require('./form/field');
var FileUpload = require('./form/file_upload');
var Hidden = require('./form/hidden');
var ImageButton = require('./form/image_button');
var MultiSelectList = require('./form/multi_select_list');
var RadioButton = require('./form/radio_button');
var Reset = require('./form/reset');
var SelectList = require('./form/select_list');
var Submit = require('./form/submit');
var Text = require('./form/text');
var Textarea = require('./form/textarea');
var querystring = require('querystring');

function initializeFields(form) {
  form.fields = [];
  form.buttons = [];
  form.fileUploads = [];
  form.radiobuttons = [];
  form.checkBoxes = [];
  form.node.find('//input').forEach(function (node) {
    var value, type;
    value = (node.attr('value') && node.attr('value').value()) || '';
    type = ((node.attr('type') && node.attr('type').value()) ||
            'text').toLocaleLowerCase();
    switch (type) {
    case "radio":
      form.radiobuttons.push(new RadioButton(form, node));
      break;
    case "checkbox":
      form.checkBoxes.push(new CheckBox(form, node));
      break;
    case "file":
      form.fileUploads.push(new FileUpload(form, node));
      break;
    case "submit":
      form.buttons.push(new Submit(form, node));
      break;
    case "button":
      form.buttons.push(new Button(form, node));
      break;
    case "reset":
      form.buttons.push(new Reset(form, node));
      break;
    case "image":
      form.buttons.push(new ImageButton(form, node));
      break;
    case "hidden":
      form.fields.push(new Hidden(form, node));
      break;
    case "text":
      form.fields.push(new Text(form, node));
      break;
    case "textarea":
      form.fields.push(new Textarea(form, node));
      break;
    default:
      form.fields.push(new Field(form, node));
    }
  });

  form.node.find('//textarea').forEach(function (node) {
    var name, field;
    name = node.attr('name') && node.attr('name').value();
    if (name) {
      field = new Field(form, node);
      field.value = node.text();
      form.fields.push(field);
    }
  });

  form.node.find('//select').forEach(function (node) {
    var name, field;
    name = node.attr('name') && node.attr('name').value();

    if (name) {
      if (node.attr('multiple')) {
        field = new MultiSelectList(form, node);
      } else {
        field = new SelectList(form, node);
      }
      form.fields.push(field);
    }
  });
  // TODO: implement

  // # Find all submit button tags
  // # FIXME: what can I do with the reset buttons?
  // form_node.search('button').each do |node|
  //   type = (node['type'] || 'submit').downcase
  //   next if type == 'reset'
  //   @buttons << Button.new(node)
  // end
}


function processQuery(form, field) {
  var queryValue = field.queryValue() || [];
  return queryValue.map(function (element) {
    return [form.fromNativeCharset(element[0]),
            form.fromNativeCharset(element[1].toString())];
  });
}

function randomString(size) {
  return 'abcdefghjiklmnopqrst';
}

function mimeValueQuote(name) {
  return name.replace(/(["\r\\])/g, function (s) {
    return '\\' + s;
  });
}

function paramToMultipart(name, value) {
  return "Content-Disposition: form-data; name=\"" +
    mimeValueQuote(name) + "\"\r\n" +
    "\r\n" + value + "\r\n";
}

function fileToMultipart(fileUpload) {
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

function Form(page, node) {
  this.page = page;
  this.node = node;
  this.action = querystring.unescape((node.attr('action') &&
                                      node.attr('action').value()) || page.uri);
  this.method = ((node.attr('method') && node.attr('method').value()) ||
                 'GET').toUpperCase();
  this.name = node.attr('name') && node.attr('name').value();
  this.enctype = (node.attr('enctype') && node.attr('enctype').value()) ||
    'application/x-www-form-urlencoded';
  this.clickedButtons = [];

  initializeFields(this);
}

Form.prototype.field = function (name) {
  return this.fields.filter(function (f) {
    return f.name === name;
  })[0];
};

Form.prototype.checkBox = function (name) {
  return this.checkBoxes.filter(function (f) {
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
  queryFields = this.fields.concat(this.checkBoxes);

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
    this.enctype = "multipart/form-data; boundary=" + boundary;
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
      return "--" + boundary + "\r\n" + param;
    }).join('') + "--" + boundary + "--\r\n";
  }
  return buildQueryString(queryParams);
};

Form.prototype.deleteField = function (name) {
  this.fields = this.fields.filter(function (field) {
    return field.name !== name;
  });
};

module.exports = Form;