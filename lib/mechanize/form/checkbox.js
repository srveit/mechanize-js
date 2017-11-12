'use strict';
/**
 * Initialize a new `Checkbox` field with the given `node` of the
 * given `form`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Form} form the form that includes this button
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newRadioButton} = require('./radio_button');

exports.newCheckbox = ({form, node, initialValue}) => {
  const radioButton = newRadioButton({form, node, initialValue}),
    fieldType = 'checkbox',
    queryValue = () => [[radioButton.name, radioButton.value() || 'on']];

  return Object.freeze({
    disabled: radioButton.disabled,
    domId: radioButton.domId,
    fieldType,
    name: radioButton.name,
    nodeAttr: radioButton.nodeAttr,
    queryValue,
    rawValue: radioButton.rawValue,
    setValue: radioButton.setValue,
    type: radioButton.type,
    value: radioButton.value,

    isChecked: radioButton.isChecked,
    id: radioButton.id,
    label: radioButton.label,
    uncheckPeers: radioButton.uncheckPeers,
    check: radioButton.check,
    uncheck: radioButton.uncheck,
    click: radioButton.click
  });
};
