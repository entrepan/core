const cluster = require('node:cluster');
const { ioc } = require('./container');
const { logger } = require('./logger');
const { serialize } = require('./serialize');
const { deserialize } = require('./deserialize');

class PrimaryMemory {
  constructor() {
    this.data = {};
    this.serialization = true;
    cluster.on('online', (worker) => {
      worker.on('message', (serializedData) => {
        const data = this.serialization ? deserialize(serializedData) : serializedData;
        if (data?.isSharedMemoryMessage) {
          this.handle(data, worker);
        }
      });
    });
  }

  configureCollection({ collectionName, collectionType, settings }) {
    if (this.data[collectionName]) {
      const previous = this.data[collectionName];
      this.data[collectionName] = ioc.getInstance(collectionType, settings);
      this.data[collectionName].fill(previous);
    } else {
      this.data[collectionName] = ioc.getInstance(collectionType, settings);
    }
  }

  configure({ collections }) {
    if (collections) {
      Object.entries(collections).forEach(([collectionName, value]) => {
        this.configureCollection({ collectionName, ...value });
      });
    }
  }

  handle(data, worker) {
    const value = this[data.method](data);
    const msg = {
      isSharedMemoryMessage: true,
      id: data.id,
      uuid: data.uuid,
      value,
    };
    try {
      worker.send(this.serialization ? serialize(msg) : msg);
    } catch (err) {
      logger.error(err);
    }
  }

  put({ key, tenantId, value }) {
    let collection = this.data[key];
    if (!collection) {
      if (tenantId) {
        this.configureCollection({ collectionName: key, collectionType: 'CacheTenants' });
      } else {
        this.configureCollection({ collectionName: key, collectionType: 'Dict' });
      }
      collection = this.data[key];
    }
    if (tenantId) {
      return collection?.put(tenantId, value);
    }
    return collection?.put(value);
  }

  get({ key, tenantId, id, field, value }) {
    const collection = this.data[key];
    if (!collection) {
      return undefined;
    }
    if (tenantId) {
      if (field && value) {
        return collection?.getByIndex(tenantId, field, value);
      }
      return id ? collection?.get(tenantId, id) : collection.getTenant(tenantId);
    }
    if (field && value) {
      return collection?.getByIndex(field, value);
    }
    return id ? collection?.get(id) : collection;
  }

  remove({ key, tenantId, id }) {
    if (id) {
      if (tenantId) {
        this.data[key]?.remove(tenantId, id);
      } else {
        this.data[key]?.remove(id);
      }
    } else {
      delete this.data[key];
    }
  }

  clear({ key, tenantId }) {
    if (key) {
      if (tenantId) {
        this.data[key]?.clear(tenantId);
      } else {
        this.data[key]?.clear();
      }
    } else {
      this.data = {};
    }
  }

  isExpired({ key, tenantId, id, node }) {
    const collection = this.data[key];
    if (tenantId) {
      return node ? !!collection?.isNodeExpired(tenantId, node) : collection?.isExpired(tenantId, id);
    }
    return node ? !!collection?.isNodeExpired(node) : collection?.isExpired(id);
  }
}

module.exports = { PrimaryMemory };
