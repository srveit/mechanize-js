'use strict';
const {newButton} = require('./button');

exports.newImageButton = ({form, node}) => {
  const button = newButton({form, node});
  let x, y;
  const buttonType = () => 'image',
    queryValue = () {
      return button.queryValue().concat([
        [button.name() + ".x", (x || 0).toString()],
        [button.name() + ".y", (y || 0).toString()]
      ]);
    };

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType: button.fieldType,
    name: button.name,
    nodeAttr: button.nodeAttr,
    queryValue,
    value: button.value,
    buttonType
  });
};
