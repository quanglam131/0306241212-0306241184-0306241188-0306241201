/**
 * Lop goi API duy nhat cua ung dung: xu ly URL goc, token vung rieng tu, loi mang va loi tu server.
 * Moi component chi goi qua object `api` ben duoi, khong goi fetch truc tiep.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

// Token mo khoa vung rieng tu chi nam trong BO NHO (khong localStorage) -> F5 la khoa lai.
let privateToken = null;
export const setPrivateToken = (t) => { privateToken = t; };
export const getPrivateToken = () => privateToken;

// Khi server tra 401 cho API vung rieng tu (het phien), thong bao cho trang Private khoa lai.
const unauthorizedListeners = new Set();
export const onUnauthorized = (fn) => {
  unauthorizedListeners.add(fn);
  return () => unauthorizedListeners.delete(fn);
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(method, path, body, { auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && privateToken) headers.Authorization = `Bearer ${privateToken}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Hãy kiểm tra Backend đã chạy chưa (cổng 5000).', 0);
  }

  let data = null;
  try { data = await res.json(); } catch { /* phan hoi khong co JSON */ }

  if (!res.ok) {
    if (res.status === 401 && auth) unauthorizedListeners.forEach((fn) => fn());
    throw new ApiError(data?.message || `Lỗi ${res.status}`, res.status, data);
  }
  return data;
}

const enc = encodeURIComponent;

export const api = {
  // Profile
  getProfile: () => request('GET', '/profile'),
  updateProfile: (data) => request('PUT', '/profile', data),

  // Chu de
  listTopics: () => request('GET', '/topics'),
  createTopic: (name) => request('POST', '/topics', { name }),
  renameTopic: (slug, name) => request('PUT', `/topics/${enc(slug)}`, { name }),
  deleteTopic: (slug) => request('DELETE', `/topics/${enc(slug)}`),

  // Ghi chu thuong
  listNotes: (slug) => request('GET', `/notes/${enc(slug)}`),
  searchNotes: (q) => request('GET', `/notes/search?q=${enc(q)}`),
  createNote: (slug, data) => request('POST', `/notes/${enc(slug)}`, data),
  updateNote: (slug, id, data) => request('PUT', `/notes/${enc(slug)}/${enc(id)}`, data),
  deleteNote: (slug, id) => request('DELETE', `/notes/${enc(slug)}/${enc(id)}`),

  // Vung rieng tu
  privateStatus: () => request('GET', '/private/status'),
  setupPrivate: (password) => request('POST', '/private/setup', { password }),
  authPrivate: (password) => request('POST', '/private/auth', { password }),
  lockPrivate: () => request('POST', '/private/lock', undefined, { auth: true }),
  changePrivatePassword: (oldPassword, newPassword) =>
    request('POST', '/private/change-password', { oldPassword, newPassword }),
  listPrivateNotes: () => request('GET', '/private/notes', undefined, { auth: true }),
  createPrivateNote: (data) => request('POST', '/private/notes', data, { auth: true }),
  updatePrivateNote: (id, data) => request('PUT', `/private/notes/${enc(id)}`, data, { auth: true }),
  deletePrivateNote: (id) => request('DELETE', `/private/notes/${enc(id)}`, undefined, { auth: true }),
};
