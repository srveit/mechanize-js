'use strict'
// eslint-disable-next-line
/**
 * Initialize a new `Field` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const decode = require('unescape')
import { nodeAttr } from '../utils.js'

exports.newField = (node, initialValue) => {
  let unescapedValue
  const getAttribute = name => nodeAttr(node, name)
  const disabled = Boolean(getAttribute('disabled'))
  const domId = getAttribute('id')
  const fieldType = 'field'
  const name = decode(getAttribute('name'))
  const escapedValue = initialValue === undefined
    ? getAttribute('value')
    : initialValue
  const rawValue = escapedValue
  const type = getAttribute('type')

  const value = () => unescapedValue

  const queryValue = () => [[name, value() || '']]

  const setValue = newValue => {
    unescapedValue = newValue
  }

  unescapedValue = decode(escapedValue)

  return Object.freeze({
    disabled,
    domId,
    fieldType,
    getAttribute,
    name,
    queryValue,
    rawValue,
    setValue,
    type,
    value,
  })
}
