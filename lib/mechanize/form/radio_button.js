var util = require('util'),
Field = require('./field'),

RadioButton = module.exports = function RadioButton(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'radio';
  this.checked = !!(node.attr('name') && node.attr('name').value());
  this.id = node.attr('id') && node.attr('id').value();
  this.label = form.labelFor(this.id);
};

util.inherits(RadioButton, Field);

RadioButton.prototype.uncheckPeers = function () {
  this.form.radiobuttons.forEach(function (radioButton) {
    if (radioButton.name === this.name && radioButton.value !== this.value) {
      radioButton.uncheck();
    }
  });
};

RadioButton.prototype.check = function () {
  this.uncheckPeers();
  this.checked = true;
};

RadioButton.prototype.uncheck = function () {
  this.checked = false;
};

RadioButton.prototype.click = function () {
  if (this.checked) {
    this.uncheck();
  } else {
    this.check();
  }
};
