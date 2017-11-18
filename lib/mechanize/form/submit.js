'use strict';
/**
 * Initialize a new `Submit` button with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newButton} = require('./button'),
  getEnctype = button => {
    const attr = button.nodeAttr('formecntype');
    if (!attr) {
      return undefined;
    } else if (attr === 'multipart/form-data' ||
               attr === 'text/plain') {
      return attr;
    }
    return 'application/x-www-form-urlencoded';
  },
  getMethod = button => {
    const attr = button.nodeAttr('formmethod');
    if (!attr) {
      return undefined;
    } else if (attr.match(/^post$/i)) {
      return 'post';
    }
    return 'get';
  },

  getBoolean = ({button, name}) => button.nodeAttr(name) ? true : false;

exports.newSubmit = ({node, initialValue}) => {
  const button = newButton({node, initialValue}),
    buttonType = 'submit',
    formAction = button.nodeAttr('formaction'),
    formEcntype = getEnctype(button),
    formMethod = getMethod(button),
    formNoValidate = getBoolean({button, name: 'formnovalidate'}),
    formTarget = button.nodeAttr('formtarget');

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType: button.fieldType,
    name: button.name,
    nodeAttr: button.nodeAttr,
    queryValue: button.queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    type: button.type,
    value: button.value,

    buttonType,
    formAction,
    formEcntype,
    formMethod,
    formNoValidate,
    formTarget
  });
};
