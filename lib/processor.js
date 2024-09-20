const { ioc } = require('./ioc');
const { normalize } = require('./normalize');
const { tokenize } = require('./tokenize');

const defaultProcessor = (text, locale, container) => tokenize(normalize(text, locale, container), locale, container);

function getProcessor(locale, container = ioc) {
  const processor = container.get(`processor-${locale}`);
  return processor || defaultProcessor;
}

function processText(text, locale, container) {
  const processor = getProcessor(locale, container);
  return processor(text, locale, container);
}

module.exports = { getProcessor, processText };
