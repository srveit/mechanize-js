'use strict';
/**
 * Initialize a new `Field` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
  * @param {String} initialValue
 * @api public
 */
const decode = require('unescape'),
  {nodeAttr} = require('../utils.js');

exports.newField = (node, initialValue) => {
  let escapedValue, unescapedValue;
  const getAttribute = name => nodeAttr({node, name}),
    disabled = !!getAttribute('disabled'),
    domId = getAttribute('id'),
    fieldType = 'field',
    name = decode(getAttribute('name')),
    queryValue = () => [[name, value() || '']],
    rawValue = escapedValue,
    setValue = newValue => unescapedValue = newValue,
    type = getAttribute('type'),
    value = () => unescapedValue;

  escapedValue = initialValue === undefined ? getAttribute('value') : initialValue;
  unescapedValue = decode(escapedValue);

  return Object.freeze({
    disabled,
    domId,
    fieldType,
    getAttribute,
    name,
    queryValue,
    rawValue,
    setValue,
    type,
    value,
  });
};
