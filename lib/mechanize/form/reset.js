var util = require('util'),
Button = require('./button'),

Reset = module.exports = function Reset(form, node) {
  Button.call(this, form, node);

  this.buttonType = 'reset';
};

util.inherits(Reset, Button);
