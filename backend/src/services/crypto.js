const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

/**
 * Ma hoa noi dung private.json bang AES-256-GCM.
 * Khoa sinh tu mat khau nguoi dung bang scrypt + salt rieng -> khong ai doc duoc file neu khong co mat khau.
 */
const newSalt = () => crypto.randomBytes(16);
const deriveKey = (password, salt) => scrypt(password, salt, 32);

function encrypt(obj, key, salt) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(obj), 'utf8'), cipher.final()]);
  return {
    version: 1,
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: data.toString('base64'),
  };
}

function decrypt(payload, key) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  const plain = Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64')), decipher.final()]);
  return JSON.parse(plain.toString('utf8'));
}

module.exports = { newSalt, deriveKey, encrypt, decrypt };
