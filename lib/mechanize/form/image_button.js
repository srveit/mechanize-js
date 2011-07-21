var util = require('util'),
Button = require('./button'),

ImageButton = module.exports = function ImageButton(form, node) {
  Button.call(this, form, node);

  this.buttonType = 'image';
  this.x = null;
  this.y = null;
};

util.inherits(ImageButton, Button);

ImageButton.prototype._queryValue = ImageButton.super_.prototype.queryValue;

ImageButton.prototype.queryValue = function () {
  return this._queryValue().concat([
    [this.name + ".x", (this.x || 0).toString()],
    [this.name + ".y", (this.y || 0).toString()]
  ]);
};
