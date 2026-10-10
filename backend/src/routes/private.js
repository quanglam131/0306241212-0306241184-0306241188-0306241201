const router = require('express').Router();
const priv = require('../services/privateService');
const sessions = require('../services/sessionService');
const requireSession = require('../middleware/requireSession');
const { validateNoteInput, validatePassword } = require('../utils/validate');
const { asyncHandler, HttpError } = require('../utils/httpError');

// GET /api/private/status -> { hasPassword }   (FE dung de biet can "dat mat khau lan dau" hay "nhap mat khau")
router.get('/status', asyncHandler(async (req, res) => res.json({ hasPassword: await priv.hasPassword() })));

// POST /api/private/setup  body: { password }   (chi chay duoc khi chua co mat khau)
router.post('/setup', asyncHandler(async (req, res) => {
  const token = await priv.setup(validatePassword(req.body?.password));
  res.status(201).json({ success: true, token });
}));

// POST /api/private/auth  body: { password } -> { success, token }
router.post('/auth', asyncHandler(async (req, res) => {
  const token = await priv.authenticate(req.body?.password);
  res.json({ success: true, token });
}));

// POST /api/private/lock  (header Authorization: Bearer <token>)
router.post('/lock', requireSession, (req, res) => {
  sessions.destroy(req.token);
  res.json({ success: true });
});

// POST /api/private/change-password  body: { oldPassword, newPassword }
router.post('/change-password', asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (typeof oldPassword !== 'string' || !oldPassword) throw new HttpError(400, 'Vui lòng nhập mật khẩu hiện tại');
  await priv.changePassword(oldPassword, validatePassword(newPassword, 'Mật khẩu mới'));
  res.json({ success: true, message: 'Đã đổi mật khẩu vùng riêng tư' });
}));

// CRUD ghi chu rieng tu - bat buoc co token
router.get('/notes', requireSession, asyncHandler(async (req, res) => res.json(await priv.list(req.session))));

router.post('/notes', requireSession, asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, note: await priv.create(req.session, validateNoteInput(req.body)) });
}));

router.put('/notes/:id', requireSession, asyncHandler(async (req, res) => {
  res.json({ success: true, note: await priv.update(req.session, req.params.id, validateNoteInput(req.body)) });
}));

router.delete('/notes/:id', requireSession, asyncHandler(async (req, res) => {
  await priv.remove(req.session, req.params.id);
  res.json({ success: true, message: 'Đã xóa ghi chú' });
}));

module.exports = router;
