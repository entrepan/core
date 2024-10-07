class Dict {
  constructor(settings = {}) {
    this.data = new Map();
    this.indexField = settings.indexField || 'id';
    if (settings.indexFields?.length > 0) {
      this.indexes = new Map();
      settings.indexFields.forEach((field) => this.indexes.set(field, new Map()));
    }
  }

  clear() {
    this.data.clear();
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

  removeNode(node) {
    this.data.delete(node[this.indexField]);
    this.removeIndexes(node.value);
    return node;
  }

  getNode(id) {
    const node = this.data.get(id);
    if (!node) {
      return undefined;
    }
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
    this.data.set(node[this.indexField], node);
    this.addIndexes(value);
    return node;
  }

  putNode(node) {
    const id = node.value[this.indexField];
    const existingNode = this.data.get(id);
    if (existingNode) {
      this.removeIndexes(node.value);
      // eslint-disable-next-line no-param-reassign
      node.updatedAt = Date.now();
      this.addIndexes(node.value);
      return node;
    }
    this.data.set(node[this.indexField], node);
    this.addIndexes(node.value);
    return node;
  }

  put(value) {
    const id = value[this.indexField];
    const node = this.data.get(id);
    if (node) {
      this.removeIndexes(node.value);
      node.updatedAt = Date.now();
      node.value = value;
      this.addIndexes(value);
      return node;
    }
    return this.newNode(id, value);
  }

  remove(id) {
    const node = this.data.get(id);
    return node ? this.removeNode(node) : undefined;
  }

  fill(obj) {
    obj.data.forEach((node) => {
      this.put(node.value);
    });
  }
}

module.exports = { Dict };
