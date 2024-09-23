const { ioc } = require('./ioc');

function stem(tokens, locale, container = ioc) {
  const fn = container.get(`stem-${locale}`);
  if (fn) {
    return fn(tokens);
  }
  return tokens;
}

module.exports = { stem };
