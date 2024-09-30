const { describe, it } = require('node:test');
const cache = require('./cache');
const cloneBuffer = require('./clone-buffer');
const cloneRegExp = require('./clone-regexp');
const clone = require('./clone');
const container = require('./container');
const deserialize = require('./deserialize');
const encryption = require('./encryption');
const expect = require('./expect');
const getMethods = require('./get-methods');
const isClass = require('./is-class');
const isFunction = require('./is-function');
const logger = require('./logger');
const serialize = require('./serialize');
const uuid = require('./uuid');

module.exports = {
  describe,
  it,
  ...cache,
  ...cloneBuffer,
  ...cloneRegExp,
  ...clone,
  ...container,
  ...deserialize,
  ...encryption,
  ...expect,
  ...getMethods,
  ...isClass,
  ...isFunction,
  ...logger,
  ...serialize,
  ...uuid,
};
