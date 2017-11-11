'use strict';
const {newField} = require('./field');

exports.RadioButton = ({form, node}) => {
  const field = newField({form, node});
  let checked = !!field.nodeAttr('checked');
  const check = () => {
      uncheckPeers();
      checked = true;
    },
    fieldType = () => 'radio',
    isChecked = () => checked,
    label = () => form.labelFor(field.domId()),
    uncheck = () => checked = false,
        click = () => {
      if (isChecked()) {
        uncheck();
      } else {
        check();
      }
    },
    uncheckPeers = () => form.radiobuttons().forEach(radioButton => {
      if (radioButton.name() === field.name() &&
          radioButton.value() !== field.value()) {
        radioButton.uncheck();
      }
    });

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    name: field.name,
    nodeAttr: field.nodeAttr,
    queryValue: field.queryValue,
    value: field.value,

    isChecked,
    label,
    uncheckPeers,
    check,
    uncheck,
    click
  });
};
