const express = require('express');
const cors = require('cors');
const { PORT, DATA_DIR } = require('./src/config');
const { ensureData } = require('./src/seed');

const app = express();
app.use(cors()); // cho phep FE (cong khac) goi API
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/profile', require('./src/routes/profile'));
app.use('/api/topics', require('./src/routes/topics'));
app.use('/api/notes', require('./src/routes/notes'));
app.use('/api/private', require('./src/routes/private'));

// Route khong ton tai
app.use('/api', (req, res) => res.status(404).json({ message: 'Không tìm thấy API' }));

// Middleware xu ly loi chung: luon tra JSON { message }
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Dữ liệu JSON gửi lên không hợp lệ' });
  const status = err.status || 500;
  if (status >= 500) console.error('[LỖI]', err);
  res.status(status).json({ message: status >= 500 ? 'Lỗi máy chủ, vui lòng thử lại' : err.message, ...(err.extra || {}) });
});

ensureData()
  .then(() => app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT} (dữ liệu: ${DATA_DIR})`)))
  .catch((err) => {
    console.error('Không khởi tạo được dữ liệu:', err);
    process.exit(1);
  });
