function isClass(obj) {
  return typeof obj === 'function' && /^\s*class\s+/.test(obj.toString());
}

module.exports = {
  isClass,
};
