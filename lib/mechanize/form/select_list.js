'use strict';
const {newMultiSelectList} = require('./multi_select_list');

exports.newSelectList = ({form, node}) => {
  const multiSelectList = newMultiSelectList({form, node}),
    fieldType = () => 'select_list';

  // TODO: implement

  return Object.freeze({
    disabled: multiSelectList.disabled,
    domId: multiSelectList.domId,
    fieldType,
    name: multiSelectList.name,
    nodeAttr: multiSelectList.nodeAttr,
    queryValue: multiSelectList.queryValue,
    value: multiSelectList.value
  });
};
