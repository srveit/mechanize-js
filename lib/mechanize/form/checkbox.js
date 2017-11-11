'use strict';
const {newRadioButton} = require('./radio_button');

exports.newCheckbox = ({form, node}) => {
  const radioButton = newRadioButton({form, node}),
    fieldType = () => 'checkbox',
    queryValue = () => [[radioButton.name(), radioButton.value() || 'on']];

  return Object.freeze({
    disabled: radioButton.disabled,
    domId: radioButton.domId,
    fieldType,
    name: radioButton.name,
    nodeAttr: radioButton.nodeAttr,
    queryValue,
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
