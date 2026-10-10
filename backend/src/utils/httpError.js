/** Loi co ma HTTP, duoc middleware loi o server.js chuyen thanh JSON { message }. */
class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

/** Boc handler async de loi tu dong chuyen xuong middleware xu ly loi. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { HttpError, asyncHandler };
