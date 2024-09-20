const crypto = require('node:crypto');

const v4 = () => crypto.randomUUID();

module.exports = {
  v4,
};
