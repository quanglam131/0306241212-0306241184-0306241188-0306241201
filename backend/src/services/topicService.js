const store = require('./fileStore');
const { topicsPath, topicFile } = require('../paths');
const { HttpError } = require('../utils/httpError');
const { slugify, isValidSlug } = require('../utils/slug');

const readTopics = () => store.readJson(topicsPath, []);

async function list() {
  const topics = await readTopics();
  return Promise.all(
    topics.map(async (t) => ({ ...t, noteCount: (await store.readJson(topicFile(t.slug), [])).length }))
  );
}

async function assertExists(slug) {
  if (!isValidSlug(slug)) throw new HttpError(400, 'Mã chủ đề không hợp lệ');
  const topic = (await readTopics()).find((t) => t.slug === slug);
  if (!topic) throw new HttpError(404, 'Không tìm thấy chủ đề');
  return topic;
}

async function create(name) {
  const slug = slugify(name);
  if (!slug) throw new HttpError(400, 'Tên chủ đề cần có ít nhất một chữ cái hoặc chữ số');
  return store.update(topicsPath, [], async (topics) => {
    if (topics.some((t) => t.slug === slug)) throw new HttpError(409, 'Chủ đề này đã tồn tại');
    const topic = { slug, name, createdAt: new Date().toISOString() };
    // Tao san file ghi chu rong cho chu de moi.
    await store.writeJson(topicFile(slug), await store.readJson(topicFile(slug), []));
    return { data: [...topics, topic], result: { ...topic, noteCount: 0 } };
  });
}

/** Doi ten hien thi; giu nguyen slug de khong phai doi ten file. */
async function rename(slug, name) {
  await assertExists(slug);
  return store.update(topicsPath, [], (topics) => {
    const idx = topics.findIndex((t) => t.slug === slug);
    if (idx === -1) throw new HttpError(404, 'Không tìm thấy chủ đề');
    if (topics.some((t, i) => i !== idx && t.name.toLowerCase() === name.toLowerCase())) {
      throw new HttpError(409, 'Đã có chủ đề trùng tên');
    }
    const next = topics.map((t, i) => (i === idx ? { ...t, name } : t));
    return { data: next, result: next[idx] };
  });
}

/** Xoa chu de kem toan bo ghi chu ben trong. */
async function remove(slug) {
  await assertExists(slug);
  await store.update(topicsPath, [], (topics) => ({ data: topics.filter((t) => t.slug !== slug), result: null }));
  await store.remove(topicFile(slug));
}

module.exports = { list, create, rename, remove, assertExists, readTopics };
