'use strict';
const {newButton} = require('./button');

exports.newReset = ({form, node}) => {
  const button = newButton({form, node}),
    buttonType = () => 'reset';

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType: button.fieldType,
    name: button.name,
    nodeAttr: button.nodeAttr,
    queryValue: button.queryValue,
    value: button.value,
    buttonType
  });
};
