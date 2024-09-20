const cloneBuffer = (cur) =>
  cur instanceof Buffer ? Buffer.from(cur) : new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);

module.exports = { cloneBuffer };
