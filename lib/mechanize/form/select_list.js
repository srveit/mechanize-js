var util = require('util'),
MultiSelectList = require('./multi_select_list'),

SelectList = module.exports = function SelectList(form, node) {
  MultiSelectList.call(this, form, node);

  this.fieldType = 'select_list';
};

util.inherits(SelectList, MultiSelectList);

// TODO: implement
