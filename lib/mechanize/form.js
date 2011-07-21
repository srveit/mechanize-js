var Args = require("vargs").Constructor,
Button = require('./form/button'),
CheckBox = require('./form/check_box'),
Field = require('./form/field'),
FileUpload = require('./form/file_upload'),
Hidden = require('./form/hidden'),
ImageButton = require('./form/image_button'),
MultiSelectList = require('./form/multi_select_list'),
RadioButton = require('./form/radio_button'),
Reset = require('./form/reset'),
SelectList = require('./form/select_list'),
Submit = require('./form/submit'),
Text = require('./form/text'),
Textarea = require('./form/textarea'),
querystring = require('querystring'),

initializeFields = function (form) {
  form.fields = [];
  form.buttons = [];
  form.fileUploads = [];
  form.radiobuttons = [];
  form.checkboxes = [];
  form.node.find('//input').forEach(function (node) {
    var value = node.attr('value') && node.attr('value').value() || '',
    type = (node.attr('type') && node.attr('type').value() || 'text').toLocaleLowerCase();
    switch (type) {
    case "radio":
      form.radiobuttons.push(new RadioButton(form, node));
      break;
    case "checkbox":
      form.checkboxes.push(new CheckBox(form, node));
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
    var name = node.attr('name') && node.attr('name').value(),
    field;
    if (name) {
      field = new Field(form, node);
      field.value = node.text();
      form.fields.push(field);
    }
  });

  form.node.find('//select').forEach(function (node) {
    var name = node.attr('name') && node.attr('name').value(),
    field;
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
},


processQuery = function (form, field) {
  var queryValue = field.queryValue() || [];
  return queryValue.map(function (element) {
    return [form.fromNativeCharset(element[0]), 
            form.fromNativeCharset(element[1].toString())];
  });
},

randomString = function (size) {
  return 'abcdefghjiklmnopqrst';
},

mimeValueQuote = function (name) {
  return name.replace(/(["\r\\])/g, function (s) {
    return '\\' + s;
  });
},

paramToMultipart = function (name, value) {
  return "Content-Disposition: form-data; name=\"" +
    mimeValueQuote(name) + "\"\r\n" +
    "\r\n" + value + "\r\n";
},

fileToMultipart = function (fileUpload) {
  // TODO: implement
},

buildQueryString = function (params) {
  return params.filter(function (param) {
    return param[0];
  }).map(function (param) {
    return param.map(function (nameOrValue) {
      return querystring.escape(nameOrValue);
    }).join('=');
  }).join('&');
},

Form = module.exports = function Form(page, node) {
  this.page = page;
  this.node = node;
  this.action = querystring.unescape(node.attr('action') &&
                                     node.attr('action').value() || page.uri);
  this.method = (node.attr('method') && node.attr('method').value() ||
                 'GET').toUpperCase();
  this.name = node.attr('name') && node.attr('name').value();
  this.enctype = node.attr('enctype') && node.attr('enctype').value() ||
    'application/x-www-form-urlencoded';
  this.clickedButtons = [];

  initializeFields(this);
};

Form.prototype.field = function (name) {
  return this.fields.filter(function (f) {
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

Form.prototype.submit = function (button, headers, fn) {
  var args = new(Args)(arguments);
  button = args.first;
  headers = args.at(1) || {};
  this.page.submit(this, button, headers, function (err, page) {
    args.callback(err, page);
  });
};

Form.prototype.addButtonToQuery = function (button) {
  this.clickedButtons.push(button);
};

Form.prototype.buildQuery = function () {
  var that = this,
  query = [],
  queryValue,
  queryFields = this.fields.concat(this.checkboxes);

  queryFields.forEach(function (field) {
    queryValue = processQuery(that, field);
    query = query.concat(queryValue);
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
  var queryParams = this.buildQuery(),
  boundary,
  params;
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
      return  "--" + boundary + "\r\n" + param;
    }).join('') + "--" + boundary + "--\r\n";
  } else {
    return buildQueryString(queryParams);
  }
};
