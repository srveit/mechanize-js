'use strict';
/**
 * Initialize a new `MultiSelectList` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newField} = require('./field');

exports.newMultiSelectList = (node) => {
  const field = newField(node, []),
    fieldType = 'multiSelectList';

  // TODO: implement

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
    value: field.value
  });
};
