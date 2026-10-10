const path = require('path');

/**
 * Cau hinh chung cua Backend.
 * Co the doi bang bien moi truong (PORT, DATA_DIR) ma khong can sua code.
 */
module.exports = {
  PORT: Number(process.env.PORT) || 5000,
  DATA_DIR: process.env.DATA_DIR || path.join(__dirname, '..', 'data'),
  // Do an ban hien tai la 1 nguoi dung. Van giu cau truc data/users/<id>/ theo de bai
  // de sau nay mo rong dang nhap nhieu nguoi dung.
  USER_ID: 'default',
  SESSION_TTL_MS: 15 * 60 * 1000, // phien mo khoa vung rieng tu: 15 phut khong thao tac thi khoa lai
  MAX_FAILED_ATTEMPTS: 5, // sai mat khau 5 lan lien tiep...
  LOCK_DURATION_MS: 60 * 1000, // ...thi tam khoa 60 giay
  MIN_PASSWORD_LENGTH: 4,
};
