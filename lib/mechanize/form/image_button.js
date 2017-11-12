'use strict';
/**
 * Initialize a new `ImageButton` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newButton} = require('./button');

exports.newImageButton = ({node, initialValue}) => {
  const button = newButton({node, initialValue});
  let x, y;
  const buttonType = 'image',
    queryValue = () => {
      return button.queryValue().concat([
        [button.name + ".x", (x || 0).toString()],
        [button.name + ".y", (y || 0).toString()]
      ]);
    };

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType: button.fieldType,
    name: button.name,
    nodeAttr: button.nodeAttr,
    queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    type: button.type,
    value: button.value,

    buttonType
  });
};
