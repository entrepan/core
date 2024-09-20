function cloneRegExp(obj) {
  const flags =
    (obj.global ? 'g' : '') +
    (obj.ignoreCase ? 'i' : '') +
    (obj.multiline ? 'm' : '') +
    (obj.sticky ? 'y' : '') +
    (obj.unicode ? 'u' : '');
  return new RegExp(obj.source, flags);
}

module.exports = { cloneRegExp };
