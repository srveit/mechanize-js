var util = require('util'),
Field = require('./field'),

Hidden = module.exports = function Hidden(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'hidden';
};

util.inherits(Hidden, Field);
