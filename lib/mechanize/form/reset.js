'use strict';
/**
 * Initialize a new `Reset` button with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newButton} = require('./button');

exports.newReset = ({node, initialValue}) => {
  const button = newButton({node, initialValue}),
    buttonType = 'reset';

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

    buttonType
  });
};
