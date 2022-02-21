'use strict';

const jsdom = require('jsdom');

const XPathResult = {};
XPathResult.ANY_TYPE = 0;
XPathResult.ORDERED_NODE_ITERATOR_TYPE = 0;
XPathResult.FIRST_ORDERED_NODE_TYPE = 9;

const parseHtmlString = body => {
  let doc;
  try {
    const dom = new jsdom.JSDOM(body);
    doc = dom.window.document;
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console
  }
  return doc;
};

const xPathResultToArray = xPathResult => {
  const array = [];
  let node = xPathResult.iterateNext();

  while (node) {
    array.push(node);
    node = xPathResult.iterateNext();
  }
  return array;
};

const nodeAttr = (node, name) => {
  if (node) {
    if (node.getAttribute) {
      return node.getAttribute(name);
    }
    return node[name];
  }
  return undefined;
};

const evaluate = (xpathExpression, contextNode, resultType) => {
  const document = contextNode.constructor.name === 'Document' ?
    contextNode :
    contextNode.ownerDocument;
  return document.evaluate(
    xpathExpression,
    contextNode,
    null,
    resultType,
    null
  );
};

const at = (doc, xpathExpression) => evaluate(
  xpathExpression,
  doc,
  XPathResult.FIRST_ORDERED_NODE_TYPE
).singleNodeValue;

const search = (doc, xpathExpression) => xPathResultToArray(evaluate(
  xpathExpression,
  doc,
  XPathResult.ORDERED_NODE_ITERATOR_TYPE
));

const textContent = element => element && element.textContent;

module.exports = {
  at,
  nodeAttr,
  parseHtmlString,
  search,
  textContent
};
