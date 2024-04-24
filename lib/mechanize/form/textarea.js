'use strict'
// eslint-disable-next-line
/**
 * Initialize a new `Textarea` field with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
import { newField } from './field'
import { textContent } from '../utils.js'

exports.newTextarea = (node, initialValue) => {
  const field = newField(node, initialValue)
  const fieldType = 'textarea'
  const value = () => textContent(node)

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
    value,
  })
}
