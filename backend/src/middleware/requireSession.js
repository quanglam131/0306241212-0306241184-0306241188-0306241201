const sessions = require('../services/sessionService');
const { HttpError } = require('../utils/httpError');

/** Chan moi API vung rieng tu neu khong co token hop le (khong chi an giao dien o FE). */
function requireSession(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = token ? sessions.get(token) : null;
  if (!session) return next(new HttpError(401, 'Vùng riêng tư đang khóa hoặc phiên đã hết hạn'));
  req.session = session;
  req.token = token;
  next();
}

module.exports = requireSession;
