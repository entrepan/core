const crypto = require('node:crypto');
const { clone } = require('./clone');

const algorithm = 'aes-256-cbc';

function generateIv() {
  return crypto.randomBytes(16);
}

function encrypt(secretKey, text) {
  const iv = generateIv();
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(secretKey, text) {
  const index = text.indexOf(':');
  const iv = Buffer.from(text.slice(0, index), 'hex');
  const encryptedText = Buffer.from(text.slice(index + 1), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString();
}

function isEncrypted(text, encryptionKey) {
  try {
    decrypt(encryptionKey, text);
    return true;
  } catch (err) {
    return false;
  }
}

function ensureEncrypted(text, encryptionKey) {
  if (!text) {
    return text;
  }
  return isEncrypted(text, encryptionKey) ? text : encrypt(encryptionKey, text);
}

function ensureDecrypted(text, encryptionKey) {
  if (!text) {
    return text;
  }
  return isEncrypted(text, encryptionKey) ? decrypt(encryptionKey, text) : text;
}

function encryptFields(srcObj, fields, encryptionKey) {
  const obj = clone(srcObj);
  fields.forEach((field) => {
    obj[field] = ensureEncrypted(obj[field], encryptionKey);
  });
  return obj;
}

function decryptFields(srcObj, fields, encryptionKey) {
  const obj = clone(srcObj);
  fields.forEach((field) => {
    obj[field] = ensureDecrypted(obj[field], encryptionKey);
  });
  return obj;
}

module.exports = {
  encrypt,
  decrypt,
  ensureEncrypted,
  ensureDecrypted,
  encryptFields,
  decryptFields,
  isEncrypted,
};
