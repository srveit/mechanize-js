var nodeAttr = function (node, name) {
  if (node.attr) {
    return node.attr(name) && node.attr(name).value();
  } else {
    return node[name];
  }
},

Link = module.exports = function Link(page, node) {
  this.page = page;
  this.node = node;
  this.href = nodeAttr(node, 'href');
  this.domID = nodeAttr(node, 'id');
};

Link.prototype.__defineGetter__("text", function () {
  if (!this._text) {
    this._text = this.node.text();
    if (!this._text) {
      this._text =
        this.node.find('//img').map(function (node) {
          return nodeAttr(node, 'alt');
        }).join('');
    }
  }
  return this._text;
});
