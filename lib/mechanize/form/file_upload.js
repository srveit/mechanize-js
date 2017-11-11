'use strict';
const {newField} = require('./field');

exports.newFileUpload = ({form, node}) => {
  const field = newField({form, node}),
    fieldType = () => 'file';

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
