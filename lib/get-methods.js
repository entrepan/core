function getMethods(obj) {
  const result = {};
  let current = obj;
  while (current) {
    const methods = Object.getOwnPropertyNames(current).filter(
      // eslint-disable-next-line no-loop-func
      (prop) => typeof current[prop] === 'function'
    );
    methods.forEach((method) => {
      result[method] = true;
    });
    current = Object.getPrototypeOf(current);
  }
  return Object.keys(result);
}

module.exports = { getMethods };
