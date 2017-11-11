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

exports.newField = ({form, node}) => {
  const disabled = () => !!nodeAttr('disabled'),
    fieldType = () => 'field',
    name = () => nodeAttr('name'),
    nodeAttr = name => {
      if (node.attr) {
        return node.attr(name) && node.attr(name).value();
      } else {
        return node[name];
      }
    },
    queryValue = () => [[name(), value() || '']],
    value = () => nodeAttr('value');
    
  return Object.freeze({
    disabled,
    fieldType,
    name,
    nodeAttr,
    queryValue,
    value
  });
};
