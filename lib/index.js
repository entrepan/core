const { describe, it } = require('node:test');
const cache = require('./cache');
const cloneBuffer = require('./clone-buffer');
const cloneRegExp = require('./clone-regexp');
const clone = require('./clone');
const deserialize = require('./deserialize');
const encryption = require('./encryption');
const expect = require('./expect');
const factory = require('./factory');
const getMethods = require('./get-methods');
const ioc = require('./ioc');
const isFunction = require('./is-function');
const logger = require('./logger');
const normalize = require('./normalize');
const process = require('./process');
const removeStopwords = require('./remove-stopwords');
const serialize = require('./serialize');
const stem = require('./stem');
const stopwords = require('./stopwords');
const tokenize = require('./tokenize');
const uuid = require('./uuid');

module.exports = {
  describe,
  it,
  ...cache,
  ...cloneBuffer,
  ...cloneRegExp,
  ...clone,
  ...deserialize,
  ...encryption,
  ...expect,
  ...factory,
  ...getMethods,
  ...ioc,
  ...isFunction,
  ...logger,
  ...normalize,
  ...process,
  ...removeStopwords,
  ...serialize,
  ...stem,
  ...stopwords,
  ...tokenize,
  ...uuid,
};
