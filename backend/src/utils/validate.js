const { HttpError } = require('./httpError');
const { MIN_PASSWORD_LENGTH } = require('../config');

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Kiem tra tieu de + noi dung ghi chu. Tieu de toan dau cach bi tu choi (TC-03). */
function validateNoteInput(body) {
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const content = typeof body?.content === 'string' ? body.content : '';
  if (!title) throw new HttpError(400, 'Vui lòng nhập tiêu đề');
  if (title.length > 150) throw new HttpError(400, 'Tiêu đề tối đa 150 ký tự');
  if (content.length > 10000) throw new HttpError(400, 'Nội dung tối đa 10.000 ký tự');
  return { title, content };
}

function validateTopicName(body) {
  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  if (!name) throw new HttpError(400, 'Vui lòng nhập tên chủ đề');
  if (name.length > 40) throw new HttpError(400, 'Tên chủ đề tối đa 40 ký tự');
  return name;
}

function validatePassword(value, label = 'Mật khẩu') {
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `${label} không được để trống`);
  if (value.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, `${label} tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`);
  if (value.length > 100) throw new HttpError(400, `${label} tối đa 100 ký tự`);
  return value;
}

/** Chi giu cac truong hop le cua profile, bo qua moi truong la (chong ghi de bay). */
function validateProfilePatch(body) {
  const patch = {};
  if (body?.displayName !== undefined) {
    if (typeof body.displayName !== 'string') throw new HttpError(400, 'Tên hiển thị không hợp lệ');
    const name = body.displayName.trim();
    if (name.length > 50) throw new HttpError(400, 'Tên hiển thị tối đa 50 ký tự');
    patch.displayName = name;
  }
  const pref = body?.preferences;
  if (pref !== undefined && pref !== null) {
    patch.preferences = {};
    if (pref.theme !== undefined) {
      if (!['light', 'dark'].includes(pref.theme)) throw new HttpError(400, 'Theme chỉ nhận "light" hoặc "dark"');
      patch.preferences.theme = pref.theme;
    }
    if (pref.primaryColor !== undefined) {
      if (!HEX_COLOR.test(pref.primaryColor)) throw new HttpError(400, 'Màu chủ đạo phải có dạng #RRGGBB');
      patch.preferences.primaryColor = pref.primaryColor.toLowerCase();
    }
  }
  return patch;
}

module.exports = { validateNoteInput, validateTopicName, validatePassword, validateProfilePatch };
