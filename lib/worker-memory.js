const cluster = require('node:cluster');
const { v4 } = require('./uuid');
const { serialize } = require('./serialize');
const { deserialize } = require('./deserialize');

class WorkerMemory {
  constructor() {
    this.callbacks = {};
    this.serialization = true;
    process.on('message', (serializedData) => {
      const data = this.serialization ? deserialize(serializedData) : serializedData;
      if (data.isSharedMemoryMessage) {
        const cb = this.callbacks[data.uuid];
        if (typeof cb === 'function') {
          cb(data.value);
        }
        delete this.callbacks[data.uuid];
      }
    });
  }

  handle(method, settings, cb) {
    const uuid = v4();
    const cloned = { ...settings, method, isSharedMemoryMessage: true, uuid, wid: cluster.worker.id, pid: process.pid };
    process.send(this.serialization ? serialize(cloned) : cloned);
    this.callbacks[uuid] = cb;
  }

  put(settings) {
    return new Promise((resolve) => {
      this.handle('put', settings, () => resolve());
    });
  }

  get(settings) {
    return new Promise((resolve) => {
      this.handle('get', settings, (value) => resolve(value));
    });
  }

  remove(settings) {
    return new Promise((resolve) => {
      this.handle('remove', settings, () => resolve());
    });
  }

  clear(settings) {
    return new Promise((resolve) => {
      this.handle('clear', settings, () => resolve());
    });
  }

  isExpired(settings) {
    return new Promise((resolve) => {
      this.handle('isExpired', settings, (value) => resolve(value));
    });
  }
}

module.exports = { WorkerMemory };
