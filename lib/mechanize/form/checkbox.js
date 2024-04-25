// eslint-disable-next-line
/**
 * Initialize a new `Checkbox` field with the given `node` of the
 * given `form`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {Form} form the form that includes this button
 * @param {String} initialValue
 * @api public
 */
import { newRadioButton } from './radio_button.js'

export function newCheckbox(node, form) {
  const radioButton = newRadioButton(node, form)
  const fieldType = 'checkbox'
  const queryValue = () => [[radioButton.name, radioButton.value() || 'on']]

  return Object.freeze({
    check: radioButton.check,
    click: radioButton.click,
    disabled: radioButton.disabled,
    domId: radioButton.domId,
    fieldType,
    getAttribute: radioButton.getAttribute,
    id: radioButton.id,
    isChecked: radioButton.isChecked,
    label: radioButton.label,
    name: radioButton.name,
    queryValue,
    rawValue: radioButton.rawValue,
    setValue: radioButton.setValue,
    type: radioButton.type,
    uncheck: radioButton.uncheck,
    uncheckPeers: radioButton.uncheckPeers,
    value: radioButton.value,
  })
}
