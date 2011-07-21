var util = require('util'),
Field = require('./field'),

Text = module.exports = function Text(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'text';
};

util.inherits(Text, Field);
