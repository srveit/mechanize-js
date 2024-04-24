'use strict'
// eslint-disable-next-line
/**
 * Initialize a new `Button` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
import { newField } from './field'

exports.newButton = (node, initialValue) => {
  const field = newField(node, initialValue)
  const fieldType = 'button'

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    getAttribute: field.getAttribute,
    name: field.name,
    queryValue: field.queryValue,
    rawValue: field.rawValue,
    setValue: field.setValue,
    type: field.type,
    value: field.value,
  })
}
