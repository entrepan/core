const pino = require('pino');

const loggers = new Map();
const DEFAULT_LOGGER_NAME = 'DEFAULT';

let defaultOptions = {
  level: process.env.LOG_LEVEL || 'info',
};

function setDefaultLoggerOptions(options) {
  defaultOptions = options;
}

function createLogger(name, options = defaultOptions) {
  const logger = pino(options);
  logger.log = logger.info;
  loggers.set(name, logger);
  return logger;
}

function getLogger(name = DEFAULT_LOGGER_NAME) {
  if (!loggers.has(name)) {
    return createLogger(name);
  }
  return loggers.get(name);
}

const logger = getLogger();

module.exports = {
  DEFAULT_LOGGER_NAME,
  setDefaultLoggerOptions,
  createLogger,
  getLogger,
  logger,
};
