var util = require('util'),
Field = require('./field'),

Textarea = module.exports = function Textarea(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'textarea';
};

util.inherits(Textarea, Field);
