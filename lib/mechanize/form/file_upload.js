'use strict';
/**
 * Initialize a new `FileUpload` with the given `node`.
 * If `initialValue` is undefined, uses the "value" attribute of `node`.
 *
 * @param {Element} node
 * @param {String} initialValue
 * @api public
 */
const decode = require('unescape'),
  {newField} = require('./field');

exports.newFileUpload = (node, initialFilename) => {
  let theFilename = decode(initialFilename), theMimeType;
  const field = newField(node),
    fieldType = 'fileUpload',
    setFilename = newFilename => theFilename = newFilename,
    filename = () => theFilename,
    setMimeType = newMimeType => theMimeType = newMimeType,
    mimeType = () => theMimeType;

  return Object.freeze({
    disabled: field.disabled,
    domId: field.domId,
    fieldType,
    fileData: field.value,
    filename,
    getAttribute: field.getAttribute,
    mimeType,
    name: field.name,
    queryValue: field.queryValue,
    rawValue: field.rawValue,
    setFileData: field.setValue,
    setFilename,
    setMimeType,
    setValue: field.setValue,
    type: field.type,
    value: field.value,
  });
};
