'use strict'
// eslint-disable-next-line
/**
 * Initialize a new `Reset` button with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const { newButton } = require('./button')

exports.newReset = (node, initialValue) => {
  const button = newButton(node, initialValue)
  const fieldType = 'reset'

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType,
    getAttribute: button.getAttribute,
    name: button.name,
    queryValue: button.queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    type: button.type,
    value: button.value,
  })
}
