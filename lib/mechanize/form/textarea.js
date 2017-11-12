'use strict';
/**
 * Initialize a new `Textarea` field with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newField} = require('./field');

exports.newTextarea = ({node, initialValue}) => {
  const field = newField({node, initialValue}),
    fieldType = 'textarea',
    value = () => node.text();

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    name: field.name,
    nodeAttr: field.nodeAttr,
    queryValue: field.queryValue,
    rawValue: field.rawValue,
    setValue: field.setValue,
    type: field.type,
    value
  });
};
