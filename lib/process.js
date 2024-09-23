const { ioc } = require('./ioc');
const { normalize } = require('./normalize');
const { removeStopwords } = require('./remove-stopwords');
const { stem } = require('./stem');
const { tokenize } = require('./tokenize');

function getSettings(locale = 'en', container = ioc, srcSettings = undefined) {
  if (srcSettings) {
    return srcSettings;
  }
  const settings = container.get(`settings-${locale}`);
  return settings || { removeStopwords: false };
}

function process(text, locale = 'en', container = ioc, srcSettings = undefined) {
  let current = text;
  const settings = getSettings(locale, container, srcSettings);
  if (settings.normalize !== false) {
    current = normalize(current, locale, container);
  }
  current = tokenize(current, locale, container);
  if (settings.removeStopwords) {
    current = removeStopwords(current, locale, container);
  }
  if (settings.stem !== false) {
    current = stem(current, locale, container);
  }
  return current;
}

module.exports = { process };
