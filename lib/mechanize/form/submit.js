'use strict';
const {newButton} = require('./button');

exports.newSubmit = ({form, node}) => {
  const button = newButton({form, node}),
    buttonType = () => 'submit';

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
