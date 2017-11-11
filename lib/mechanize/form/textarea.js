'use strict';
const {newField} = require('./field');

exports.newTextarea = ({form, node}) => {
  const field = newField({form, node}),
    fieldType = () => 'textarea';

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    name: field.name,
    nodeAttr: field.nodeAttr,
    queryValue: field.queryValue,
    value: field.value
  });
};
