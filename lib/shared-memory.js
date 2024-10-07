const cluster = require('node:cluster');
const { ioc } = require('./container');
const { PrimaryMemory } = require('./primary-memory');
const { WorkerMemory } = require('./worker-memory');

const primaryMemorySettings = ioc.get('primaryMemorySettings') || ioc.get('memorySettings');
const workerMemorySettings = ioc.get('workerMemorySettings') || ioc.get('memorySettings');
const sharedMemory = cluster.isPrimary
  ? new PrimaryMemory(primaryMemorySettings)
  : new WorkerMemory(workerMemorySettings);

module.exports = { sharedMemory };
