const path = require('path');
const { DATA_DIR, USER_ID } = require('./config');

/**
 * Cau truc thu muc (theo de bai):
 * data/users/<user>/profile.json
 * data/users/<user>/private.json   (da ma hoa AES-256-GCM)
 * data/users/<user>/topics.json    (danh sach chu de)
 * data/users/<user>/notes/<slug>.json
 */
const userDir = path.join(DATA_DIR, 'users', USER_ID);
const notesDir = path.join(userDir, 'notes');

module.exports = {
  userDir,
  notesDir,
  profilePath: path.join(userDir, 'profile.json'),
  privatePath: path.join(userDir, 'private.json'),
  topicsPath: path.join(userDir, 'topics.json'),
  topicFile: (slug) => path.join(notesDir, `${slug}.json`),
};
