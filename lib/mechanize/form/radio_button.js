var util = require('util'),
Field = require('./field'),

nodeAttr = function (node, name) {
  if (node.attr) {
    return node.attr(name) && node.attr(name).value();
  } else {
    return node[name];
  }
},

RadioButton = module.exports = function RadioButton(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'radio';
  this.checked = !!nodeAttr(node, 'checked');
  this.id = nodeAttr('id');
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
