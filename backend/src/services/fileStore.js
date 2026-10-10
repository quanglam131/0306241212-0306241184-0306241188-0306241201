const fs = require('fs');
const path = require('path');
const fsp = fs.promises;

/**
 * Lop doc/ghi file JSON an toan:
 *  - Ghi qua file tam roi rename: mat dien giua chung khong lam hong file that.
 *  - Hang doi theo tung file: nhieu request cung luc se duoc xep hang, khong ghi de nhau.
 */
const queues = new Map();

function withLock(key, task) {
  const prev = queues.get(key) || Promise.resolve();
  const run = prev.then(() => task());
  queues.set(key, run.catch(() => {}));
  return run;
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return typeof fallback === 'function' ? fallback() : fallback;
    if (err instanceof SyntaxError) throw new Error(`File JSON bị hỏng: ${path.basename(file)}`);
    throw err;
  }
}

async function writeJson(file, data) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fsp.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fsp.rename(tmp, file);
}

/**
 * Doc -> sua -> ghi trong 1 khoa. mutator(current) tra ve { data, result }.
 * Neu mutator nem loi thi file khong bi ghi.
 */
function update(file, fallback, mutator) {
  return withLock(file, async () => {
    const current = await readJson(file, fallback);
    const { data, result } = await mutator(current);
    if (data !== undefined) await writeJson(file, data);
    return result;
  });
}

async function remove(file) {
  return withLock(file, async () => {
    try {
      await fsp.unlink(file);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  });
}

module.exports = { readJson, writeJson, update, remove, withLock };
