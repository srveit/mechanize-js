'use strict';
exports.newLink = node => {
  const nodeAttr = ({node, name}) => {
      if (node && node.attr) {
        return node.attr(name) && node.attr(name).value();
      } else if (node) {
        return node[name];
      }
      return undefined;
    },

    search = xpath => node ? node.find(xpath) : [],

    text = () => node.text() || node
      .find('//img')
      .map(node => nodeAttr({node, name: 'alt'}))
      .join('');


  return Object.freeze({
    domId: nodeAttr({node, name: 'id'}),
    href: nodeAttr({node, name: 'href'}),
    node,
    search,
    text
  });
};
