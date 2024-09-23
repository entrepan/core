const { ioc } = require('./ioc');

const defaultNormalize = (text) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function normalize(text, locale, container = ioc) {
  const fn = container.get(`normalize-${locale}`);
  if (fn) {
    return fn(text);
  }
  return defaultNormalize(text);
}

module.exports = { normalize, defaultNormalize };
