const DEFAULT_CACHE_CAPACITY = process.env.DEFAULT_CACHE_CAPACITY || 300;

class Cache {
  constructor(settings = {}) {
    this.data = new Map();
    this.indexField = settings.indexField || 'id';
    this.capacity = settings.capacity || DEFAULT_CACHE_CAPACITY;
    this.maxAge = settings.maxAge || 900;
    this.autoRemoveExpired = settings.autoRemoveExpired ?? true;
    if (settings.indexFields?.length > 0) {
      this.indexes = new Map();
      settings.indexFields.forEach((field) => this.indexes.set(field, new Map()));
    }
    this.head = undefined;
    this.tail = undefined;
  }

  clear() {
    this.data.clear();
    this.head = undefined;
    this.tail = undefined;
  }

  get keys() {
    return this.indexes ? [...this.indexes.keys()] : [];
  }

  iterateIndexes(value, fn) {
    this.keys.forEach((field) => {
      if (value[field]) {
        const index = this.indexes.get(field);
        fn(index, field);
      }
    });
  }

  addIndexes(value) {
    if (this.indexes) {
      this.iterateIndexes(value, (index, field) => {
        index.set(value[field], value[this.indexField]);
      });
    }
  }

  removeIndexes(value) {
    if (this.indexes) {
      this.iterateIndexes(value, (index, field) => {
        index.delete(value[field]);
      });
    }
  }

  addToFront(srcNode) {
    const node = srcNode;
    if (this.head) {
      node.next = this.head;
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.data.set(node[this.indexField], node);
    return node;
  }

  moveToFront(srcNode) {
    const node = srcNode;
    if (this.head === node) {
      return node;
    }
    if (this.tail === node) {
      this.tail = node.prev;
    }
    node.prev.next = node.next;
    if (node.next) {
      node.next.prev = node.prev;
    }
    node.prev = undefined;
    node.next = this.head;
    this.head.prev = node;
    this.head = node;
    return node;
  }

  removeNode(srcNode) {
    const node = srcNode;
    if (this.head === node) {
      this.head = node.next;
    }
    if (this.tail === node) {
      this.tail = node.prev;
    }
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    node.prev = undefined;
    node.next = undefined;
    this.data.delete(node[this.indexField]);
    this.removeIndexes(node.value);
    return node;
  }

  removeOld() {
    return this.tail ? this.removeNode(this.tail) : undefined;
  }

  isNodeExpired(node) {
    if (!this.maxAge || this.maxAge === Infinity) {
      return false;
    }
    return Math.floor((Date.now() - node.updatedAt) / 1000) > this.maxAge;
  }

  isExpired(id) {
    const node = this.data.get(id);
    return node ? this.isNodeExpired(node) : false;
  }

  getNode(id) {
    const node = this.data.get(id);
    if (!node) {
      return undefined;
    }
    if (this.maxAge && this.autoRemoveExpired && this.isNodeExpired(node)) {
      this.removeNode(node);
      return undefined;
    }
    this.moveToFront(node);
    return node;
  }

  get(id) {
    const node = this.getNode(id);
    return node?.value;
  }

  getIdByIndex(field, value) {
    if (field === this.indexField) {
      return value;
    }
    if (!this.indexes) {
      return undefined;
    }
    const index = this.indexes.get(field);
    if (!index) {
      return undefined;
    }
    return index.get(value);
  }

  getByIndex(field, value) {
    const id = this.getIdByIndex(field, value);
    return id ? this.get(id) : undefined;
  }

  newNode(id, value) {
    const node = { id, value, updatedAt: Date.now() };
    this.addToFront(node);
    this.addIndexes(value);
    while (this.data.size > this.capacity) {
      this.removeOld();
    }
    return node;
  }

  putNode(node) {
    const id = node.value[this.indexField];
    const existingNode = this.data.get(id);
    if (existingNode) {
      this.removeIndexes(node.value);
      // eslint-disable-next-line no-param-reassign
      node.updatedAt = Date.now();
      this.moveToFront(node);
      this.addIndexes(node.value);
      return node;
    }
    this.addToFront(node);
    this.addIndexes(node.value);
    while (this.data.size > this.capacity) {
      this.removeOld();
    }
    return node;
  }

  put(value) {
    const id = value[this.indexField];
    const node = this.data.get(id);
    if (node) {
      this.removeIndexes(node.value);
      node.updatedAt = Date.now();
      node.value = value;
      this.moveToFront(node);
      this.addIndexes(value);
      return node;
    }
    return this.newNode(id, value);
  }

  remove(id) {
    const node = this.data.get(id);
    return node ? this.removeNode(node) : undefined;
  }

  setCapacity(capacity) {
    this.capacity = capacity;
    while (this.data.size > this.capacity) {
      this.removeOld();
    }
  }
}

module.exports = { Cache };
