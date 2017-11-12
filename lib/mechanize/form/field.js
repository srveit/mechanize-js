'use strict';
/**
 * Initialize a new `Field` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialName
 * @param {String} initialValue
 * @api public
 */
const decode = require('unescape');

exports.newField = ({node, initialName, initialValue}) => {
  let escapedValue, unescapedValue;
  const disabled = !!nodeAttr('disabled'),
    domId = nodeAttr('id'),
    fieldType = 'field',
    name = initialName === undefined ? decode(nodeAttr('name')) : initialName,
    nodeAttr = name => {
      if (node && node.attr) {
        return node.attr(name) && node.attr(name).value();
      } else if (node) {
        return node[name];
      }
      return undefined;
    },
    queryValue = () => [[name(), value() || '']],
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
