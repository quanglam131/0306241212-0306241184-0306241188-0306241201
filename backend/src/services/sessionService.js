const crypto = require('crypto');
const { SESSION_TTL_MS } = require('../config');

/**
 * Phien mo khoa vung rieng tu, luu TRONG BO NHO (khong ghi ra file).
 * Moi phien giu khoa giai ma de doc/ghi private.json. Khoi dong lai server = tat ca bi khoa lai.
 */
const sessions = new Map();

function create(key, salt) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { key, salt, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

/** Tra ve phien con han va gia han them (sliding expiration). */
function get(token) {
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  s.expiresAt = Date.now() + SESSION_TTL_MS;
  return s;
}

const destroy = (token) => sessions.delete(token);
const destroyAll = () => sessions.clear();

setInterval(() => {
  const now = Date.now();
  for (const [t, s] of sessions) if (s.expiresAt < now) sessions.delete(t);
}, 60 * 1000).unref();

module.exports = { create, get, destroy, destroyAll };
