'use strict';
// eslint-disable-next-line
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
  let unescapedValue;
  const getAttribute = name => nodeAttr(node, name),
    disabled = Boolean(getAttribute('disabled')),
    domId = getAttribute('id'),
    fieldType = 'field',
    name = decode(getAttribute('name')),
    escapedValue = initialValue === undefined ?
      getAttribute('value') :
      initialValue,
    rawValue = escapedValue,
    type = getAttribute('type'),

    value = () => unescapedValue,

    queryValue = () => [[name, value() || '']],

    setValue = newValue => {
      unescapedValue = newValue;
    };

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
    value
  });
};
