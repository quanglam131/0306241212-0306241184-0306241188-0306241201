const bcrypt = require('bcryptjs');
const store = require('./fileStore');
const profiles = require('./profileService');
const sessions = require('./sessionService');
const cryptoSvc = require('./crypto');
const noteService = require('./noteService');
const { privatePath } = require('../paths');
const { HttpError } = require('../utils/httpError');
const { MAX_FAILED_ATTEMPTS, LOCK_DURATION_MS } = require('../config');

/* ---------- Gioi han so lan nhap sai ---------- */
const attempts = { failed: 0, lockedUntil: 0 };

function assertNotLocked() {
  const wait = attempts.lockedUntil - Date.now();
  if (wait > 0) {
    throw new HttpError(429, `Nhập sai quá nhiều lần. Thử lại sau ${Math.ceil(wait / 1000)} giây.`, {
      retryAfter: Math.ceil(wait / 1000),
    });
  }
}

function registerFailure() {
  attempts.failed += 1;
  if (attempts.failed >= MAX_FAILED_ATTEMPTS) {
    attempts.failed = 0;
    attempts.lockedUntil = Date.now() + LOCK_DURATION_MS;
  }
}

/* ---------- Trang thai & khoi tao mat khau ---------- */
async function hasPassword() {
  return Boolean((await profiles.get()).privatePasswordHash);
}

/** Lan dau: dat mat khau, tao private.json (rong, da ma hoa). Tra ve token de vao luon. */
async function setup(password) {
  if (await hasPassword()) throw new HttpError(409, 'Mật khẩu vùng riêng tư đã được thiết lập');
  const salt = cryptoSvc.newSalt();
  const key = await cryptoSvc.deriveKey(password, salt);
  await store.writeJson(privatePath, cryptoSvc.encrypt([], key, salt));
  await profiles.setPasswordHash(await bcrypt.hash(password, 10));
  return sessions.create(key, salt);
}

/** Kiem tra mat khau (bcrypt) roi sinh khoa giai ma tu mat khau + salt trong private.json. */
async function verifyAndDerive(password) {
  const profile = await profiles.get();
  if (!profile.privatePasswordHash) throw new HttpError(409, 'Chưa thiết lập mật khẩu vùng riêng tư');
  const ok = typeof password === 'string' && (await bcrypt.compare(password, profile.privatePasswordHash));
  if (!ok) return null;
  const payload = await store.readJson(privatePath, null);
  const salt = payload ? Buffer.from(payload.salt, 'base64') : cryptoSvc.newSalt();
  const key = await cryptoSvc.deriveKey(password, salt);
  return { key, salt, payload };
}

async function authenticate(password) {
  assertNotLocked();
  const derived = await verifyAndDerive(password);
  if (!derived) {
    registerFailure();
    throw new HttpError(401, 'Sai mật khẩu');
  }
  attempts.failed = 0;
  if (!derived.payload) await store.writeJson(privatePath, cryptoSvc.encrypt([], derived.key, derived.salt));
  return sessions.create(derived.key, derived.salt);
}

/** Doi mat khau: bat buoc nhap mat khau cu, giai ma bang khoa cu roi ma hoa lai bang khoa moi. */
async function changePassword(oldPassword, newPassword) {
  assertNotLocked();
  const derived = await verifyAndDerive(oldPassword);
  if (!derived) {
    registerFailure();
    throw new HttpError(401, 'Mật khẩu hiện tại không đúng');
  }
  attempts.failed = 0;
  const notes = derived.payload ? cryptoSvc.decrypt(derived.payload, derived.key) : [];
  const salt = cryptoSvc.newSalt();
  const key = await cryptoSvc.deriveKey(newPassword, salt);
  await store.withLock(privatePath, () => store.writeJson(privatePath, cryptoSvc.encrypt(notes, key, salt)));
  await profiles.setPasswordHash(await bcrypt.hash(newPassword, 10));
  sessions.destroyAll(); // moi phien cu deu mat hieu luc
}

/* ---------- CRUD ghi chu rieng tu (da ma hoa) ---------- */
function readNotes(session, payload) {
  return payload ? cryptoSvc.decrypt(payload, session.key) : [];
}

async function list(session) {
  const payload = await store.readJson(privatePath, null);
  return readNotes(session, payload).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Doc-giai ma-sua-ma hoa-ghi trong cung 1 khoa de khong mat du lieu khi thao tac dong thoi. */
function mutate(session, fn) {
  return store.withLock(privatePath, async () => {
    const payload = await store.readJson(privatePath, null);
    const { notes, result } = fn(readNotes(session, payload));
    await store.writeJson(privatePath, cryptoSvc.encrypt(notes, session.key, session.salt));
    return result;
  });
}

const create = (session, input) =>
  mutate(session, (notes) => {
    const note = noteService.newNote(input);
    return { notes: [...notes, note], result: note };
  });

const update = (session, id, input) =>
  mutate(session, (notes) => {
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) throw new HttpError(404, 'Không tìm thấy ghi chú');
    const note = { ...notes[idx], ...input, updatedAt: new Date().toISOString() };
    return { notes: notes.map((n, i) => (i === idx ? note : n)), result: note };
  });

const remove = (session, id) =>
  mutate(session, (notes) => {
    if (!notes.some((n) => n.id === id)) throw new HttpError(404, 'Không tìm thấy ghi chú');
    return { notes: notes.filter((n) => n.id !== id), result: null };
  });

module.exports = { hasPassword, setup, authenticate, changePassword, list, create, update, remove };
