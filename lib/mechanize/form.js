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

  getBoolean = ({node, name}) => nodeAttr({node, name}) ? true : false,

  newForm = ({page, node}) => {
    let fields = [], queryFields = [];
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
        let successfulControls;

        successfulControls = fields.filter(field => !field.disabled);
        successfulControls = successfulControls.concat(
          checkboxes
            .filter(checkbox => !checkbox.disable && checkbox.isChecked())
        );
        successfulControls = successfulControls.concat(clickedButtons);

        return successfulControls.reduce(
          (query, control) => query.concat(processQuery(control)),
          []
        );
      },

      encodeMultipart = (queryParams) => {
        const params = [];
        queryParams.forEach(queryParam => {
          if (queryParam[0]) {
            params.push(paramToMultipart({
              name: queryParam[0],
              value: queryParam[1]
            }));
          }
        });
        fileUploads.forEach(fileUpload => {
          params.push(fileToMultipart(fileUpload));
        });
        return params.map(param => {
          return '--' + boundary + '\r\n' + param;
        }).join('') + '--' + boundary + '--\r\n';
      },

      encodeText = (queryParams) =>
        queryParams.map(queryParam => queryParam.join('=')).join('\n'),

      requestData = (enctype) => {
        const queryParams = buildQuery();

        if (enctype === 'multipart/form-data') {
          return encodeMultipart(queryParams);
        } else if (enctype === 'text/plain') {
          return encodeText(queryParams);
        }
        return buildQueryString(queryParams);
      },

      field = name => fields.filter(field => field.name === name)[0],

      checkbox = name => checkboxes.filter(field => field.name === name)[0],

      addField = (name, value) =>
        fields.push(newField({name}, value)),

      deleteField = name => fields = fields.filter(field => field.name !== name),

      setFieldValue = (name, value) => {
        const f = field(name);
        if (f) {
          f.setValue(value);
        } else {
          addField(name, value);
        }
      },

      fieldValue = (name) => field(name) && field(name).value(),

      labelFor = id => page.labelFor(id),

      submitButton = () =>
        buttons.filter(button => button.fieldType === 'submit')[0],

      submit = ({button, headers, requestOptions}) =>
        page.submit({form, button, headers, requestOptions}),

      allFields = () => radiobuttons
        .concat(checkboxes)
        .concat(fileUploads)
        .concat(buttons)
        .concat(fields),

      initializeFields = () => {
        if (node) {
          node.find('//input').forEach(node => {
            const type = (nodeAttr({node, name: 'type'}) || 'text')
              .toLocaleLowerCase();
            switch (type) {
            case 'radio':
              radiobuttons.push(newRadioButton(node, form));
              break;
            case 'checkbox':
              checkboxes.push(newCheckbox(node, form));
              break;
            case 'file':
              fileUploads.push(newFileUpload(node));
              break;
            case 'submit':
              buttons.push(newSubmit(node));
              break;
            case 'button':
              buttons.push(newButton(node));
              break;
            case 'reset':
              buttons.push(newReset(node));
              break;
            case 'image':
              buttons.push(newImageButton(node));
              break;
            case 'hidden':
              fields.push(newHidden(node));
              break;
            case 'text':
              fields.push(newText(node));
              break;
            case 'textarea':
              fields.push(newTextarea(node));
              break;
            default:
              fields.push(newField(node));
            }
          });

          node.find('//textarea').forEach(node => {
            const name = nodeAttr({node, name: 'name'});
            if (name) {
              fields.push(newTextarea(node));
            }
          });

          node.find('//select').forEach(node => {
            const name = nodeAttr({node, name: 'name'});
            if (name) {
              if (node.attr('multiple')) {
                fields.push(newMultiSelectList(node));
              } else {
                fields.push(newSelectList(node));
              }
            }
          });

          // FIXME: what can I do with the reset buttons?
          node.find('//button').forEach(node => {
            const type = node.attr('type') && node.attr('type').value().toLowerCase() || 'submit';
            if (type !== 'reset') {
              buttons.push(newButton(node));
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
        fields: allFields,
        fieldValue,
        labelFor,
        method,
        name,
        noValidate,
        page,
        requestData,
        setFieldValue,
        submit,
        submitButton,
        target
      };

    initializeFields();

    return Object.freeze(form);
  };

exports.newForm = newForm;
