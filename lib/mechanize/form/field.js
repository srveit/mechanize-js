// eslint-disable-next-line
/**
 * Initialize a new `Field` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
import { nodeAttr } from '../utils.js'

export function newField(node, initialValue) {
  const getAttribute = (name) => nodeAttr(node, name)
  const disabled = Boolean(getAttribute('disabled'))
  const domId = getAttribute('id')
  const fieldType = 'field'
  const name = getAttribute('name') || ''
  const type = getAttribute('type')
  const queryValue = () => [[name, value || '']]
  let value = initialValue === undefined ? getAttribute('value') : initialValue

  return Object.freeze({
    disabled,
    domId,
    fieldType,
    getAttribute,
    name,
    queryValue,
    setValue: (newValue) => {
      value = newValue
    },
    type,
    value: () => value,
  })
}
