'use strict';
/**
 * Initialize a new `ImageButton` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newSubmit} = require('./submit');

exports.newImageButton = (node, initialValue) => {
  const button = newSubmit(node, initialValue);
  let theX, theY;
  const fieldType = 'imageButton',
     queryValue = () => {
      return button.queryValue().concat([
        [button.name + '.x', (theX || 0).toString()],
        [button.name + '.y', (theY || 0).toString()]
      ]);
    },
    setX = newX => theX = newX,
    x = () => theX,
    setY = newY => theY = newY,
    y = () => theY;

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType,
    formAction: button.formAction,
    formEcntype: button.formEcntype,
    formMethod: button.formMethod,
    formNoValidate: button.formNoValidate,
    formTarget: button.formTarget,
    name: button.name,
    nodeAttr: button.nodeAttr,
    queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    setX,
    setY,
    type: button.type,
    value: button.value,
    x,
    y
  });
};
