const { ioc } = require('./ioc');

function normalize(text, locale, container = ioc) {
  const fn = container.get(`normalize-${locale}`);
  if (fn) {
    return fn(text);
  }
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

module.exports = { normalize };
