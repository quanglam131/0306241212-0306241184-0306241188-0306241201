const router = require('express').Router();
const notes = require('../services/noteService');
const { validateNoteInput } = require('../utils/validate');
const { asyncHandler } = require('../utils/httpError');

// GET /api/notes/search?q=tu-khoa  (tim trong tieu de + noi dung, moi chu de)
router.get('/search', asyncHandler(async (req, res) => res.json(await notes.search(req.query.q))));

router.get('/:topic', asyncHandler(async (req, res) => res.json(await notes.list(req.params.topic))));

router.post('/:topic', asyncHandler(async (req, res) => {
  const note = await notes.create(req.params.topic, validateNoteInput(req.body));
  res.status(201).json({ success: true, note });
}));

router.put('/:topic/:id', asyncHandler(async (req, res) => {
  const note = await notes.update(req.params.topic, req.params.id, validateNoteInput(req.body));
  res.json({ success: true, note });
}));

router.delete('/:topic/:id', asyncHandler(async (req, res) => {
  await notes.remove(req.params.topic, req.params.id);
  res.json({ success: true, message: 'Đã xóa ghi chú' });
}));

module.exports = router;
