const { ioc, SHELVES } = require('./container');

function innerDeserialize(current, refs) {
  if (current === null || current === undefined) {
    return current;
  }
  if (typeof current === 'string' && current.startsWith('@@ref:')) {
    const ref = parseInt(current.substring(6), 10);
    return refs[ref];
  }
  if (Array.isArray(current)) {
    return current.map((x) => innerDeserialize(x, refs));
  }
  if (current.className === 'Object') {
    const obj = {};
    Object.entries(current).forEach(([key, value]) => {
      obj[key] = innerDeserialize(value, refs);
    });
    return obj;
  }
  if (current.className === 'Date') {
    return new Date(current.value);
  }
  if (current.className === 'RegExp') {
    return new RegExp(current.value);
  }
  if (['Map', 'Set', 'ArrayBufferView'].includes(current.className)) {
    const arr = current.value.map((x) => innerDeserialize(x, refs));
    if (current.className === 'ArrayBufferView') {
      const TypedArray = global[current.subClassName];
      return new TypedArray(arr);
    }
    return current.className === 'Map' ? new Map(arr) : new Set(arr);
  }
  return current;
}

function deserialize(input) {
  const { refs, value } = input;
  if (!refs) {
    return input;
  }
  const objs = [];
  for (let i = 0; i < refs.length; i += 1) {
    const ref = refs[i];
    const deserializer = ioc.get(ref.className, SHELVES.Deserializers);
    const obj = deserializer ? deserializer(ref.value) : ioc.getInstance(ref.className, undefined) || {};
    objs.push(obj);
  }
  for (let i = 0; i < objs.length; i += 1) {
    const refvalue = refs[i].value;
    const obj = objs[i];
    Object.entries(refvalue).forEach(([key, current]) => {
      obj[key] = innerDeserialize(current, objs);
    });
  }
  if (typeof value === 'string' && value.startsWith('@@ref:')) {
    const ref = parseInt(value.substring(6), 10);
    return objs[ref];
  }
  return value;
}

module.exports = {
  deserialize,
};
