var util = require('util'),
RadioButton = require('./radio_button'),

Checkbox = module.exports = function Checkbox(form, node) {
  RadioButton.call(this, form, node);

  this.fieldType = 'checkbox';
};

util.inherits(Checkbox, RadioButton);

Checkbox.prototype.queryValue = function () {
  return [[this.name, this.value || "on"]];
};
