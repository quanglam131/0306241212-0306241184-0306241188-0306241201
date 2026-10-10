const store = require('./fileStore');
const { profilePath } = require('../paths');

/** Dang profile.json theo de bai: displayName, preferences, privatePasswordHash. */
const defaultProfile = () => ({
  displayName: 'Sinh viên',
  preferences: { theme: 'light', primaryColor: '#4f46e5' },
  privatePasswordHash: null,
});

/** Gop voi mac dinh de file thieu truong van chay duoc. */
function normalize(raw) {
  const d = defaultProfile();
  return {
    displayName: typeof raw?.displayName === 'string' ? raw.displayName : d.displayName,
    preferences: { ...d.preferences, ...(raw?.preferences || {}) },
    privatePasswordHash: raw?.privatePasswordHash || null,
  };
}

const get = async () => normalize(await store.readJson(profilePath, defaultProfile));

/** Ban gui ve FE: KHONG bao gio chua hash mat khau. */
const toPublic = (p) => ({
  displayName: p.displayName,
  preferences: p.preferences,
  hasPrivatePassword: Boolean(p.privatePasswordHash),
});

/** Gop (merge) thay vi ghi de ca file -> gui thieu truong khong lam mat du lieu. */
const patch = (changes) =>
  store.update(profilePath, defaultProfile, (current) => {
    const cur = normalize(current);
    const next = {
      ...cur,
      ...(changes.displayName !== undefined ? { displayName: changes.displayName } : {}),
      preferences: { ...cur.preferences, ...(changes.preferences || {}) },
    };
    return { data: next, result: next };
  });

const setPasswordHash = (hash) =>
  store.update(profilePath, defaultProfile, (current) => {
    const next = { ...normalize(current), privatePasswordHash: hash };
    return { data: next, result: next };
  });

module.exports = { get, patch, toPublic, setPasswordHash, defaultProfile };
