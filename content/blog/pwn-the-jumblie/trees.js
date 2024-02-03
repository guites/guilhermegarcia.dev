class Tree {
  constructor(nodes) {
    this.nodes = nodes;
  }

  addChild(node) {
    this.nodes.push(node);
  }

  getNodeByName(name) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      if (node.name === name) return node;
    }
    return false;
  }
}

class Node {
  constructor(name, children) {
    this.name = name;
    this.children = children ?? [];
  }

  getChildByName(name) {
    if (this.children && this.children.length > 0) {
      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];
        if (child.name === name) return child;
      }
    }
    return false;
  }

  getDescendantByName(name) {
    if (this.name === name) return this;
    if (this.children && this.children.length > 0) {
      for (let i = 0; i < this.children.length; i++) {
        const descendant = this.children[i].getDescendantByName(name);
        if (descendant) return descendant;
      }
    }
    return false;
  }

  addChild(node) {
    this.children.push(node);
    return node;
  }

  removeChildByName(name) {
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (name === child.name) {
        this.children.splice(this.children.indexOf(child), 1);
      }
    }
  }
}

module.exports = { Tree, Node };
