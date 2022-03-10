'use strict'
// eslint-disable-next-line
/**
 * Initialize a new `History`.
 * @api public
 */

exports.newHistory = () => {
  const pages = []
  let theCurrentPage = null

  const push = page => {
    pages.push(page)
    theCurrentPage = page
  }

  const currentPage = () => theCurrentPage

  return Object.freeze({
    currentPage,
    push,
  })
}
