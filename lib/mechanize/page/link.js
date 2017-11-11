'use strict';
exports.newLink = node => {
  const nodeAttr = (name) => {
    if (node.attr) {
      return node.attr(name) && node.attr(name).value();
    } else {
      return node[name];
    }
  };

  const text = () => {
    text = node.text() ||
      node.find('//img').map(function (node) {
        return nodeAttr(node, 'alt');
      }).join('');
  };

  return Object.freeze({
    href: nodeAttr('href'),
    domID: nodeAttr('id'),
    text: text
  });
};
