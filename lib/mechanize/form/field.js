'use strict';
/**
 * Initialize a new `Field` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
  * @param {String} initialValue
 * @api public
 */
const decode = require('unescape');

exports.newField = (node, initialValue) => {
  let escapedValue, unescapedValue;
  const nodeAttr = name => {
      if (node && node.attr) {
        return node.attr(name) && node.attr(name).value();
      } else if (node) {
        return node[name];
      }
      return undefined;
    },
    disabled = !!nodeAttr('disabled'),
    domId = nodeAttr('id'),
    fieldType = 'field',
    name = decode(nodeAttr('name')),
    queryValue = () => [[name, value() || '']],
    rawValue = escapedValue,
    setValue = newValue => unescapedValue = newValue,
    type = nodeAttr('type'),
    value = () => unescapedValue;

  escapedValue = initialValue === undefined ? nodeAttr('value') : initialValue;
  unescapedValue = decode(escapedValue);

  return Object.freeze({
    disabled,
    domId,
    fieldType,
    name,
    nodeAttr,
    queryValue,
    rawValue,
    setValue,
    type,
    value
  });
};
