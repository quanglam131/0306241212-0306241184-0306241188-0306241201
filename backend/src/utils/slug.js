/** "Học tập & Ý tưởng" -> "hoc-tap-y-tuong" (dung lam ten file an toan). */
function slugify(text) {
  return String(text)
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '');
}

/** Chi chap nhan chu thuong, so, dau gach ngang -> chan path traversal ("../", "/", "\"). */
const isValidSlug = (s) => typeof s === 'string' && s.length <= 50 && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

module.exports = { slugify, isValidSlug };
