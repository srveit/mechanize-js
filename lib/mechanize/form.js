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

const encodingType = ({node, boundary}) => {
  const mimeType = (node.attr('enctype') && node.attr('enctype').value()) ||
    'application/x-www-form-urlencoded';
  if (mimeType.match(/^multipart\/form-data/)) {
    return 'multipart/form-data; boundary=' + boundary;
  }
  return mimeType;
},

  randomString = size =>
        'abcdefghjiklmnopqrstuvwxyz0123456789'.substr(0, size),

  urlencode = str => encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
        .replace(/\*/g, '%2A')
        .replace(/%20/g, '+'),

  buildQueryString = params => params
        .filter(param => param[0])
        .map(
          param => param.map(nameOrValue => urlencode(nameOrValue)).join('=')
        )
        .join('&'),

  mimeValueQuote = name => name.replace(/(["\r\\])/g, s => '\\' + s),

  paramToMultipart = ({name, value}) => 'Content-Disposition: form-data; ' +
        'name="' + mimeValueQuote(name) + '"\r\n' +
        '\r\n' + value + '\r\n',

  fileToMultipart = fileUpload => {
    // TODO: implement
    return fileUpload;
  };

exports.newForm = ({page, node}) => {
  const action =
          querystring.unescape((node.attr('action') &&
                                node.attr('action').value()) || page.uri),
    enctype = encodingType(node, boundary),
    method = ((node.attr('method') && node.attr('method').value()) ||
              'GET').toUpperCase(),
    name = node.attr('name') && node.attr('name').value(),
    boundary = randomString(20),
    clickedButtons = [],
    fields = [],
    buttons = [],
    fileUploads = [],
    radiobuttons = [],
    checkboxes = [],

    addButtonToQuery = button => {
      clickedButtons.push(button);
    },

    fromNativeCharset = string => string, // TODO: implement

    processQuery = field => {
      const queryValue = field.queryValue() || [];
      return queryValue.map(element => {
        return [fromNativeCharset(element[0]),
                fromNativeCharset(element[1].toString())];
      });
    },

    buildQuery = () => {
      const queryFields = fields.concat(checkboxes);

      return queryFields.reduce(
        (query, field) => {
          if ((field.fieldType() !== 'checkbox' || field.checked()) &&
              !field.disabled()) {
            return query.concat(processQuery(field));
          }
          return query;
        },
        []
      );
    },

    requestData = () => {
      const queryParams = buildQuery();

      if (enctype.match(/^multipart\/form-data/)) {
        const params = [];
        queryParams.forEach(queryParam => {
          if (queryParam[0]) {
            params.push(paramToMultipart(queryParam[0], queryParam[1]));
          }
        });
        fileUploads.forEach(fileUpload => {
          params.push(fileToMultipart(fileUpload));
        });
        return params.map(param => {
          return '--' + boundary + '\r\n' + param;
        }).join('') + '--' + boundary + '--\r\n';
      }
      return buildQueryString(queryParams);
    },

    field = name => fields.filter(field => field.name === name)[0],

    checkbox = name => this.checkboxes.filter(field => field.name === name)[0],

    addField = ({name, value}) =>
          fields.push(newField({initialName: name, initialValue: value})),

    deleteField = name => fields = fields.filter(field => field.name !== name),

    setFieldValue = ({name, value}) => {
      const f = field(name);
      if (f) {
        f.setValue(value);
      } else {
        addField(name, value);
      }
    },

    labelFor = id => page.labelFor(id),

    submit = ({button, headers, requestOptions}) =>
          page.submit({form, button, headers, requestOptions}),

    initializeFields = () => {
      node.find('//input').forEach(input => {
        const type = ((input.attr('type') && input.attr('type').value()) ||
                      'text').toLocaleLowerCase();
        switch (type) {
        case 'radio':
          radiobuttons.push(newRadioButton({form, node: input}));
          break;
        case 'checkbox':
          checkboxes.push(newCheckbox({form, node: input}));
          break;
        case 'file':
          fileUploads.push(newFileUpload({node: input}));
          break;
        case 'submit':
          buttons.push(newSubmit({node: input}));
          break;
        case 'button':
          buttons.push(newButton({node: input}));
          break;
        case 'reset':
          buttons.push(newReset({node: input}));
          break;
        case 'image':
          buttons.push(newImageButton({node: input}));
          break;
        case 'hidden':
          fields.push(newHidden({node: input}));
          break;
        case 'text':
          fields.push(newText({node: input}));
          break;
        case 'textarea':
          fields.push(newTextarea({node: input}));
          break;
        default:
          fields.push(newField({node: input}));
        }
      });

      node.find('//textarea').forEach(textarea => {
        const name = textarea.attr('name') && textarea.attr('name').value();
        if (name) {
          fields.push(newTextarea({node: textarea}));
        }
      });

      node.find('//select').forEach(select => {
        const name = select.attr('name') && select.attr('name').value();
        if (name) {
          if (select.attr('multiple')) {
            fields.push(newMultiSelectList({node: select}));
          } else {
            fields.push(newSelectList({node: select}));
          }
        }
      });

      // FIXME: what can I do with the reset buttons?
      node.find('//button').forEach(button => {
        const type = (button.attr('type') || 'submit').toLowerCase();
        if (type !== 'reset') {
          buttons.push(newButton({node: button}));
        }
      });
    },

    form = {
      action,
      addButtonToQuery,
      addField,
      buildQuery,
      checkbox,
      deleteField,
      enctype,
      field,
      labelFor,
      method,
      name,
      page,
      requestData,
      setFieldValue
    };

  initializeFields();

  return Object.freeze(form);
};
