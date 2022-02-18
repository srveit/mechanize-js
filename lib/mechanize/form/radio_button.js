'use strict';
/**
 * Initialize a new `RadioButton` field with the given `node` of the
 * given `form`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Form} form the form that includes this button
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const {newField} = require('./field');

exports.newRadioButton = (node, form) => {
  const field = newField(node);
  let checked = !!field.getAttribute('checked');
  const check = () => {
      uncheckPeers();
      checked = true;
    },
    click = () => {
      if (isChecked()) {
        uncheck();
      } else {
        check();
      }
    },
    fieldType = 'radioButton',
    isChecked = () => checked,
    label = () => form.labelFor(field.domId),
    text = () => label() && label().text,
    uncheck = () => checked = false,
    uncheckPeers = () => form.radiobuttons().forEach(radioButton => {
      if (radioButton.name() === field.name &&
          radioButton.value() !== field.value()) {
        radioButton.uncheck();
      }
    });

  return Object.freeze({
    check,
    click,
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    form,
    getAttribute: field.getAttribute,
    isChecked,
    label,
    name: field.name,
    queryValue: field.queryValue,
    rawValue: field.rawValue,
    setValue: field.setValue,
    text,
    type: field.type,
    uncheck,
    uncheckPeers,
    value: field.value,
  });
};
