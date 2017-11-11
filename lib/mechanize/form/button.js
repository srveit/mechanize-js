'use strict';
const {newField} = require('./field');

exports.newButton = ({form, node}) => {
  const field = newField({form, node}),
    buttonType = () => 'button',
    fieldType = () => '';

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    name: field.name,
    nodeAttr: field.nodeAttr,
    queryValue: field.queryValue,
    value: field.value,
    buttonType
  });
};
