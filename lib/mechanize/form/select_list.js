// eslint-disable-next-line
/**
 * Initialize a new `SelectList` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
import { newMultiSelectList } from './multi_select_list.js'

export function newSelectList(node) {
  const multiSelectList = newMultiSelectList(node)
  const fieldType = 'selectList'

  // eslint-disable-next-line
  // TODO: implement

  return Object.freeze({
    disabled: multiSelectList.disabled,
    domId: multiSelectList.domId,
    fieldType,
    getAttribute: multiSelectList.getAttribute,
    name: multiSelectList.name,
    queryValue: multiSelectList.queryValue,
    rawValue: multiSelectList.rawValue,
    setValue: multiSelectList.setValue,
    type: multiSelectList.type,
    value: multiSelectList.value,
  })
}
