// eslint-disable-next-line
/**
 * Initialize a new `MultiSelectList` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
import { newField } from './field.js'

export function newMultiSelectList(node) {
  const field = newField(node, [])
  const fieldType = 'multiSelectList'

  // eslint-disable-next-line
  // TODO: implement

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
