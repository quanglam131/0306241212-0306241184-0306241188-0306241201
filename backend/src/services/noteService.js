const crypto = require('crypto');
const store = require('./fileStore');
const topics = require('./topicService');
const { topicFile } = require('../paths');
const { HttpError } = require('../utils/httpError');

/** Ghi chu: { id, title, content, createdAt, updatedAt } theo de bai. */
const newNote = ({ title, content }) => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title, content, createdAt: now, updatedAt: now };
};

async function list(slug) {
  await topics.assertExists(slug);
  const notes = await store.readJson(topicFile(slug), []);
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function create(slug, input) {
  await topics.assertExists(slug);
  return store.update(topicFile(slug), [], (notes) => {
    const note = newNote(input);
    return { data: [...notes, note], result: note };
  });
}

async function update(slug, id, input) {
  await topics.assertExists(slug);
  return store.update(topicFile(slug), [], (notes) => {
    const idx = notes.findIndex((n) => n.id === id);
    if (idx === -1) throw new HttpError(404, 'Không tìm thấy ghi chú');
    const note = { ...notes[idx], ...input, updatedAt: new Date().toISOString() };
    return { data: notes.map((n, i) => (i === idx ? note : n)), result: note };
  });
}

async function remove(slug, id) {
  await topics.assertExists(slug);
  return store.update(topicFile(slug), [], (notes) => {
    if (!notes.some((n) => n.id === id)) throw new HttpError(404, 'Không tìm thấy ghi chú');
    return { data: notes.filter((n) => n.id !== id), result: null };
  });
}

/** Tim theo tu khoa trong tieu de HOAC noi dung, tren tat ca chu de. */
async function search(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const all = await topics.readTopics();
  const results = [];
  for (const t of all) {
    const notes = await store.readJson(topicFile(t.slug), []);
    for (const n of notes) {
      if (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) {
        results.push({ ...n, topic: t.slug, topicName: t.name });
      }
    }
  }
  return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

module.exports = { list, create, update, remove, search, newNote };
