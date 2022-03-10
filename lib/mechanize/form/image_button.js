'use strict'
// eslint-disable-next-line
/**
 * Initialize a new `ImageButton` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const { newSubmit } = require('./submit')

exports.newImageButton = (node, initialValue) => {
  const button = newSubmit(node, initialValue)
  let theX, theY
  const fieldType = 'imageButton'

  const queryValue = () => button.queryValue().concat([
    [button.name + '.x', (theX || 0).toString()],
    [button.name + '.y', (theY || 0).toString()],
  ])

  const setX = newX => {
    theX = newX
  }

  const x = () => theX

  const setY = newY => {
    theY = newY
  }

  const y = () => theY

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType,
    formAction: button.formAction,
    formEcntype: button.formEcntype,
    formMethod: button.formMethod,
    formNoValidate: button.formNoValidate,
    formTarget: button.formTarget,
    getAttribute: button.getAttribute,
    name: button.name,
    queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    setX,
    setY,
    type: button.type,
    value: button.value,
    x,
    y,
  })
}
