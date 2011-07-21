var util = require('util'),
Field = require('./field'),

FileUpload = module.exports = function FileUpload(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'file';
  this.filename = null;
  this.mimeType = null;
  this.fileData = null;
};

util.inherits(FileUpload, Field);
