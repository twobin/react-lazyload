/**
 * @fileOverview Find scroll parent
 */

export default (node) => {
  if (!node) {
    return document;
  }

  const excludeStaticParent = node.style.position === 'absolute';
  const overflowRegex = /(scroll|auto)/;
  let parent = node;

  while(parent) {
    if (!parent.parentNode) {
      return node.ownerDocument || document;
    }

    const { position, overflow, overflowX, overflowY } = parent.style;
    if (position === 'static' && excludeStaticParent) {
      continue;
    }

    if (overflowRegex.test(overflow + overflowX + overflowY)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return node.ownerDocument || document;
}
