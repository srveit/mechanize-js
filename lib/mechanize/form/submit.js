'use strict';
// eslint-disable-next-line
/**
 * Initialize a new `Submit` button with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const {newButton} = require('./button');

exports.newSubmit = (node, initialValue) => {
  const button = newButton(node, initialValue),
    fieldType = 'submit',
    formAction = button.getAttribute('formaction'),
    formTarget = button.getAttribute('formtarget'),

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

    getBoolean = (button, name) => Boolean(button.getAttribute(name)),

    formEcntype = getEnctype(button),
    formMethod = getMethod(button),
    formNoValidate = getBoolean(button, 'formnovalidate');

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
    value: button.value
  });
};
