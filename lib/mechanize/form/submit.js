'use strict';
/**
 * Initialize a new `Submit` button with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const {newButton} = require('./button'),
  getEnctype = button => {
    const attribute = button.getAttribute('formecntype');
    if (!attribute) {
      return undefined;
    } else if (attribute === 'multipart/form-data' ||
               attribute === 'text/plain') {
      return attribute;
    }
    return 'application/x-www-form-urlencoded';
  },
  getMethod = button => {
    const attribute = button.getAttribute('formmethod');
    if (!attribute) {
      return undefined;
    } else if (attribute.match(/^post$/i)) {
      return 'post';
    }
    return 'get';
  },

  getBoolean = ({button, name}) => button.getAttribute(name) ? true : false;

exports.newSubmit = (node, initialValue) => {
  const button = newButton(node, initialValue),
    fieldType = 'submit',
    formAction = button.getAttribute('formaction'),
    formEcntype = getEnctype(button),
    formMethod = getMethod(button),
    formNoValidate = getBoolean({button, name: 'formnovalidate'}),
    formTarget = button.getAttribute('formtarget');

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType,
    formAction,
    formEcntype,
    formMethod,
    formNoValidate,
    formTarget,
    getAttribute: button.getAttribute,
    name: button.name,
    queryValue: button.queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    type: button.type,
    value: button.value,
  });
};
