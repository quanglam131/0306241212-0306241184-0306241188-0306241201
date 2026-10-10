const router = require('express').Router();
const profiles = require('../services/profileService');
const { validateProfilePatch } = require('../utils/validate');
const { asyncHandler } = require('../utils/httpError');

// GET /api/profile -> { displayName, preferences, hasPrivatePassword }
router.get('/', asyncHandler(async (req, res) => {
  res.json(profiles.toPublic(await profiles.get()));
}));

// PUT /api/profile  body: { displayName?, preferences?: { theme?, primaryColor? } }
router.put('/', asyncHandler(async (req, res) => {
  const updated = await profiles.patch(validateProfilePatch(req.body));
  res.json({ success: true, message: 'Đã lưu cài đặt', profile: profiles.toPublic(updated) });
}));

module.exports = router;
