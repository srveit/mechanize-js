var util = require('util'),
Button = require('./button'),

Submit = module.exports = function Submit(form, node) {
  Button.call(this, form, node);

  this.buttonType = 'submit';
};

util.inherits(Submit, Button);
