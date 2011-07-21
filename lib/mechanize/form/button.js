var util = require('util'),
Field = require('./field'),

Button = module.exports = function Button(form, node) {
  Field.call(this, form, node);

  this.fieldType = '';
  this.buttonType = 'button';
};

util.inherits(Button, Field);
