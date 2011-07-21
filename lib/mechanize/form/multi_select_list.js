var util = require('util'),
Field = require('./field'),

MultiSelectList = module.exports = function MultiSelectList(form, node) {
  Field.call(this, form, node);

  this.fieldType = 'multi_select_list';
};

util.inherits(MultiSelectList, Field);

// TODO: implement
