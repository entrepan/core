const { ioc } = require('./ioc');

function tokenize(text, locale, container = ioc) {
  const fn = container.get(`tokenize-${locale}`);
  if (fn) {
    return fn(text);
  }
  return text.split(/[\s,.!?;:([\]'"¡¿)/]+/).filter((x) => x);
}

module.exports = { tokenize };
