/* @flow */

export class Leaf<T> {
  parent: RadixTrie
  children: T[] = []

  constructor(trie: RadixTrie) {
    this.parent = trie
  }

  delete(value: T) {
    const index = this.children.indexOf(value)
    if (index === -1) return false
    this.children = this.children.slice(0, index).concat(this.children.slice(index + 1))
    if (this.children.length === 0) {
      this.parent.delete(this)
    }
    return true
  }

  add(value: T) {
    this.children.push(value)
    return this
  }
}

export class RadixTrie {
  parent: RadixTrie | null = null
  children: {[key: string]: RadixTrie | Leaf<*>} = {}

  constructor(trie: ?RadixTrie) {
    this.parent = trie || null
  }

  get(edge: string) {
    return this.children[edge]
  }

  insert(edges: string[]) {
    let currentNode = this
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i]
      let nextNode = currentNode.get(edge)
      // If we're at the end of this set of edges:
      if (i === edges.length - 1) {
        // If this end already exists as a RadixTrie, then hose it and replace with a Leaf:
        if (nextNode instanceof RadixTrie) {
          currentNode.delete(nextNode)
          nextNode = null
        }
        // If nextNode doesn't exist (or used to be a RadixTrie) then make a Leaf:
        if (!nextNode) {
          nextNode = new Leaf(currentNode)
          currentNode.children[edge] = nextNode
        }
        return nextNode
        // We're not at the end of this set of edges:
      } else {
        // If we're not at the end, but we've hit a Leaf, replace with a RadixTrie
        if (nextNode instanceof Leaf) nextNode = null
        if (!nextNode) {
          nextNode = new RadixTrie(currentNode)
          currentNode.children[edge] = nextNode
        }
      }
      currentNode = nextNode
    }
    return currentNode
  }

  // eslint-disable-next-line flowtype/no-weak-types
  delete(node: RadixTrie | Leaf<any>) {
    for (const edge in this.children) {
      const currentNode = this.children[edge]
      if (currentNode === node) {
        const success = delete this.children[edge]
        if (Object.keys(this.children).length === 0 && this.parent) {
          this.parent.delete(this)
        }
        return success
      }
    }
    return false
  }
}
