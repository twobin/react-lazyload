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

  while (parent) {
    if (!parent.parentNode) {
      return node.ownerDocument || document;
    }

    const style = window.getComputedStyle(parent);
    const position = style.position;
    const overflow = style.overflow;
    const overflowX = style['overflow-x'];
    const overflowY = style['overflow-y'];

    if (position === 'static' && excludeStaticParent) {
      continue;
    }

    if (overflowRegex.test(overflow + overflowX + overflowY)) {
      return parent;
    }

    parent = parent.parentNode;
  }

  return node.ownerDocument || document;
};
