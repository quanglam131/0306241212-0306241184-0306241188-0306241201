// Xoa node_modules va dist truoc khi nen file .zip de nop bai:  npm run clean
const fs = require('fs');
const path = require('path');

const targets = ['backend/node_modules', 'frontend/node_modules', 'frontend/dist', 'node_modules'];
for (const t of targets) {
  const p = path.join(__dirname, '..', t);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log('Đã xóa', t);
  }
}
console.log('Xong. Có thể nén thư mục dự án thành .zip.');
