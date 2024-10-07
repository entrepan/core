const { Cache } = require('./cache');

const DEFAULT_CACHE_CAPACITY = process.env.DEFAULT_CACHE_CAPACITY || 300;

class CacheTenants {
  constructor(settings = {}) {
    this.settings = settings;
    this.data = new Map();
    this.tenants = {};
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

  getTenant(obj, autoCreate = false) {
    const tenantId = obj?.value?.tenantId || obj?.tenantId || obj;
    let tenant = this.tenants[tenantId];
    if (!tenant && autoCreate) {
      tenant = new Cache(this.settings);
      this.tenants[tenantId] = tenant;
    }
    return tenant;
  }

  clear(tenantId) {
    if (tenantId) {
      const tenant = this.getTenant(tenantId);
      const nodes = [...tenant.data.values()];
      nodes.forEach((node) => this.removeNode(node));
      tenant.clear();
    } else {
      this.data.clear();
      this.head = undefined;
      this.tail = undefined;
    }
  }

  isNodeExpired(node) {
    if (!this.maxAge || this.maxAge === Infinity) {
      return false;
    }
    return Math.floor((Date.now() - node.updatedAt) / 1000) > this.maxAge;
  }

  isExpired(tenantId, itemId) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) {
      return false;
    }
    const node = tenant.get(itemId);
    return node ? this.isNodeExpired(node) : false;
  }

  addIndexes(tenantId, value) {
    const tenant = this.getTenant(tenantId);
    if (tenant) {
      tenant.addIndexes(value);
    }
  }

  removeIndexes(tenantId, value) {
    const tenant = this.getTenant(tenantId);
    if (tenant) {
      tenant.removeIndexes(value);
    }
  }

  getNode(tenantId, itemId) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) {
      return undefined;
    }
    const node = tenant.getNode(itemId);
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

  get(tenantId, itemId) {
    const node = this.getNode(tenantId, itemId);
    return node?.value;
  }

  getByIndex(tenantId, field, value) {
    const tenant = this.getTenant(tenantId);
    if (!tenant) {
      return undefined;
    }
    return tenant.getByIndex(field, value);
  }

  put(tenantId, value) {
    const id = value[this.indexField];
    const node = this.getNode(tenantId, id);
    if (node) {
      this.removeIndexes(tenantId, node.value);
      node.updatedAt = Date.now();
      node.value = value;
      this.moveToFront(node);
      this.addIndexes(tenantId, value);
      return node;
    }
    return this.newNode(tenantId, id, value);
  }

  getNodeId(node) {
    return `${node.tenantId}-${node[this.indexField]}`;
  }

  removeNode(srcNode) {
    const node = srcNode;
    if (this.head === node) {
      this.head = node.nextParent;
    }
    if (this.tail === node) {
      this.tail = node.prevParent;
    }
    if (node.prevParent) {
      node.prevParent.nextParent = node.nextParent;
    }
    if (node.nextParent) {
      node.nextParent.prevParent = node.prevParent;
    }
    node.prevParent = undefined;
    node.nextParent = undefined;
    this.data.delete(this.getNodeId(node));
    this.removeIndexes(node.tenantId, node.value);
    const tenant = this.getTenant(node);
    if (tenant) {
      tenant.removeNode(node);
    }
    return node;
  }

  addToFront(srcNode) {
    const tenant = this.getTenant(srcNode, true);
    tenant.putNode(srcNode);
    const node = srcNode;
    if (this.head) {
      node.nextParent = this.head;
      this.head.prevParent = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.data.set(this.getNodeId(node), node);
    return node;
  }

  moveToFront(srcNode) {
    const tenant = this.getTenant(srcNode, true);
    tenant.putNode(srcNode);
    const node = srcNode;
    if (this.head === node) {
      return node;
    }
    if (this.tail === node) {
      this.tail = node.prevParent;
    }
    if (node.prevParent) {
      node.prevParent.nextParent = node.nextParent;
    }
    if (node.nextParent) {
      node.nextParent.prevParent = node.prevParent;
    }
    node.prevParent = undefined;
    node.nextParent = this.head;
    this.head.prevParent = node;
    this.head = node;
    return node;
  }

  newNode(tenantId, id, value) {
    const node = { id, tenantId, updatedAt: Date.now(), value };
    this.addToFront(node);
    this.addIndexes(tenantId, value);
    while (this.data.size > this.capacity) {
      this.removeOld();
    }
    return node;
  }

  removeOld() {
    return this.tail ? this.removeNode(this.tail) : undefined;
  }

  remove(tenantId, itemId) {
    const node = this.getNode(tenantId, itemId);
    return node ? this.removeNode(node) : undefined;
  }

  setCapacity(capacity) {
    this.capacity = capacity;
    while (this.data.size > this.capacity) {
      this.removeOld();
    }
  }

  fill(obj) {
    obj.data.forEach((node) => {
      this.put(node.value);
    });
  }
}

module.exports = { CacheTenants };
