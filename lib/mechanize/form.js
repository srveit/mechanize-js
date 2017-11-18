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

  nodeAttr = ({node, name}) => {
    if (node && node.attr) {
      return node.attr(name) && node.attr(name).value();
    } else if (node) {
      return node[name];
    }
    return undefined;
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
  },

  getEnctype = node => {
    const attr = nodeAttr({node, name: 'ecntype'});
    if (attr === 'multipart/form-data' || attr === 'text/plain') {
      return attr;
    }
    return 'application/x-www-form-urlencoded';
  },
  getMethod = node => {
    const attr = nodeAttr({node, name: 'method'});
    if (attr && attr.match(/^post$/i)) {
      return 'post';
    }
    return 'get';
  },

  getBoolean = ({node, name}) => nodeAttr({node, name}) ? true : false;

exports.newForm = ({page, node}) => {
  let fields = [];
  const action = nodeAttr({node, name: 'action'}),
    boundary = randomString(20),
    enctype = getEnctype(node),
    method = getMethod(node),
    name = nodeAttr({node, name: 'name'}),
    noValidate = getBoolean({node, name: 'novalidate'}),
    target = nodeAttr({node, name: 'target'}),
    clickedButtons = [],
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
        return [
          fromNativeCharset(element[0]),
          fromNativeCharset(element[1].toString())
        ];
      });
    },

    buildQuery = () => {
      const queryFields = fields.concat(checkboxes);

      return queryFields.reduce(
        (query, field) => {
          if ((field.fieldType !== 'checkbox' || field.isChecked()) &&
              !field.disabled) {
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
      if (node) {
        node.find('//input').forEach(node => {
          const type = (nodeAttr({node, name: 'type'}) || 'text')
                .toLocaleLowerCase();
          switch (type) {
          case 'radio':
            radiobuttons.push(newRadioButton({form, node}));
            break;
          case 'checkbox':
            checkboxes.push(newCheckbox({form, node}));
            break;
          case 'file':
            fileUploads.push(newFileUpload({node}));
            break;
          case 'submit':
            buttons.push(newSubmit({node}));
            break;
          case 'button':
            buttons.push(newButton({node}));
            break;
          case 'reset':
            buttons.push(newReset({node}));
            break;
          case 'image':
            buttons.push(newImageButton({node}));
            break;
          case 'hidden':
            fields.push(newHidden({node}));
            break;
          case 'text':
            fields.push(newText({node}));
            break;
          case 'textarea':
            fields.push(newTextarea({node}));
            break;
          default:
            fields.push(newField({node}));
          }
        });

        node.find('//textarea').forEach(node => {
          const name = nodeAttr({node, name: 'name'});
          if (name) {
            fields.push(newTextarea({node}));
          }
        });

        node.find('//select').forEach(node => {
          const name = nodeAttr({node, name: 'name'});
          if (name) {
            if (node.attr('multiple')) {
              fields.push(newMultiSelectList({node}));
            } else {
              fields.push(newSelectList({node}));
            }
          }
        });

        // FIXME: what can I do with the reset buttons?
        node.find('//button').forEach(node => {
          const type = (node.attr('type') || 'submit').toLowerCase();
          if (type !== 'reset') {
            buttons.push(newButton({node}));
          }
        });
      }
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
      noValidate,
      page,
      requestData,
      setFieldValue,
      submit,
      target
    };

  initializeFields();

  return Object.freeze(form);
};
