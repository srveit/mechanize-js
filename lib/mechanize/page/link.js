'use strict';
const nodeAttr = (node, name) => {
  if (node.attr) {
    return node.attr(name) && node.attr(name).value();
  } else {
    return node[name];
  }
};

exports.newLink = node => {
  const link = {
    href: nodeAttr(node, 'href'),
    domID: nodeAttr(node, 'id')
  };
  let text;

  link.text = () => {
    if (!text) {
      text = node.text() ||
        node.find('//img').map(function (node) {
          return nodeAttr(node, 'alt');
        }).join('');
    }
    return text;
  };
  return Object.freeze(link);
};
