'use strict';
/**
 * Initialize a new `Field` with the given `form` and `node`.
 * If value is undefined, uses the "value" attribute of `node`.
 *
 * @param {Form} form
 * @param {libxml.Element} element
 * @param {String} value
 * @api public
 */
const decode = require('unescape');

exports.newField = ({form, node, valueParam}) => {
  let escapedValue, unescapedValue;
  const disabled = () => !!nodeAttr('disabled'),
    domId = () => nodeAttr('id'),
    fieldType = () => 'field',
    name = () => decode(nodeAttr('name')),
    nodeAttr = name => {
      if (node.attr) {
        return node.attr(name) && node.attr(name).value();
      } else {
        return node[name];
      }
    },
    queryValue = () => [[name(), value() || '']],
    rawValue = () => escapedValue,
    type = () => nodeAttr('type'),
    value = () => unescapedValue;

  escapedValue = valueParam === undefined ? nodeAttr('value') : valueParam;
  unescapedValue = decode(escapedValue);

  return Object.freeze({
    disabled,
    domId,
    fieldType,
    name,
    nodeAttr,
    queryValue,
    value
  });
};
