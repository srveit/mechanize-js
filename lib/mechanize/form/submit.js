// eslint-disable-next-line
/**
 * Initialize a new `Submit` button with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
import { newButton } from './button.js'

export function newSubmit(node, initialValue) {
  const button = newButton(node, initialValue)
  const fieldType = 'submit'
  const formAction = button.getAttribute('formaction')
  const formTarget = button.getAttribute('formtarget')

  const getEnctype = (button) => {
    const attribute = button.getAttribute('formecntype')
    if (!attribute) {
      return undefined
    } else if (
      attribute === 'multipart/form-data' ||
      attribute === 'text/plain'
    ) {
      return attribute
    }
    return 'application/x-www-form-urlencoded'
  }

  const getMethod = (button) => {
    const attribute = button.getAttribute('formmethod')
    if (!attribute) {
      return undefined
    } else if (attribute.match(/^post$/i)) {
      return 'POST'
    }
    return 'GET'
  }

  const getBoolean = (button, name) => Boolean(button.getAttribute(name))

  const formEcntype = getEnctype(button)
  const formMethod = getMethod(button)
  const formNoValidate = getBoolean(button, 'formnovalidate')

  return Object.freeze({
    disabled: button.disabled,
    domId: button.domId,
    fieldType,
    formAction,
    formEcntype,
    formMethod,
    formNoValidate,
    formTarget,
    getAttribute: button.getAttribute,
    name: button.name,
    queryValue: button.queryValue,
    rawValue: button.rawValue,
    setValue: button.setValue,
    type: button.type,
    value: button.value,
  })
}
