'use strict';
const {newField} = require('./field');

exports.newMultiSelectList = ({form, node}) => {
  const field = newField({form, node}),
    fieldType = () => 'multi_select_list';

  // TODO: implement

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
