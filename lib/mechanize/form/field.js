/**
 * Initialize a new `Field` with the given `form` and `node`.
 * If value is undefined, uses the "value" attribute of `node`.
 *
 * @param {Form} form
 * @param {libxml.Element} element
 * @param {String} value
 * @api public
 */

var nodeAttr = function (node, name) {
  if (node.attr) {
    return node.attr(name) && node.attr(name).value();
  } else {
    return node[name];
  }
},

Field = module.exports = function Field(form, node) {
  this.form = form;
  this.node = node;
  this.name = nodeAttr(node, 'name');
  this.value = nodeAttr(node, 'value');
  this.disabled = !!nodeAttr(node, 'disabled');
  this.fieldType = 'field';
};

Field.prototype.queryValue = function () {
  return [[this.name, this.value || '']];
};
