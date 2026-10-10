const router = require('express').Router();
const topics = require('../services/topicService');
const { validateTopicName } = require('../utils/validate');
const { asyncHandler } = require('../utils/httpError');

router.get('/', asyncHandler(async (req, res) => res.json(await topics.list())));

router.post('/', asyncHandler(async (req, res) => {
  const topic = await topics.create(validateTopicName(req.body));
  res.status(201).json({ success: true, topic });
}));

router.put('/:slug', asyncHandler(async (req, res) => {
  const topic = await topics.rename(req.params.slug, validateTopicName(req.body));
  res.json({ success: true, topic });
}));

router.delete('/:slug', asyncHandler(async (req, res) => {
  await topics.remove(req.params.slug);
  res.json({ success: true, message: 'Đã xóa chủ đề' });
}));

module.exports = router;
