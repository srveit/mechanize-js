'use strict';
/**
 * Initialize a new `RadioButton` field with the given `node` of the
 * given `form`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Form} form the form that includes this button
 * @param {libxml.Element} node
 * @param {String} initialValue
 * @api public
 */
const {newField} = require('./field');

exports.newRadioButton = (node, form) => {
  const field = newField(node);
  let checked = !!field.nodeAttr('checked');
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
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    name: field.name,
    nodeAttr: field.nodeAttr,
    queryValue: field.queryValue,
    rawValue: field.rawValue,
    setValue: field.setValue,
    type: field.type,
    value: field.value,

    check,
    click,
    form,
    isChecked,
    label,
    text,
    uncheck,
    uncheckPeers
  });
};
