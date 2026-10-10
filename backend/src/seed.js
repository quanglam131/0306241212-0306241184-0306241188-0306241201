const store = require('./services/fileStore');
const { defaultProfile } = require('./services/profileService');
const { newNote } = require('./services/noteService');
const { profilePath, topicsPath, topicFile, notesDir } = require('./paths');
const fs = require('fs');

/**
 * Tu tao du lieu neu thieu (chay moi lan khoi dong server).
 * - Thieu profile.json  -> tao mac dinh.
 * - Thieu topics.json   -> tao 3 chu de + vai ghi chu mau nghiem tuc de giao dien khong bi trong.
 * Co the xoa ca thu muc data/: server van chay va tu tao lai.
 */
async function ensureData() {
  fs.mkdirSync(notesDir, { recursive: true });

  if (!fs.existsSync(profilePath)) await store.writeJson(profilePath, defaultProfile());

  if (!fs.existsSync(topicsPath)) {
    const now = new Date().toISOString();
    const topics = [
      { slug: 'hoc-tap', name: 'Học tập', createdAt: now },
      { slug: 'cong-viec', name: 'Công việc', createdAt: now },
      { slug: 'y-tuong', name: 'Ý tưởng', createdAt: now },
    ];
    const samples = {
      'hoc-tap': [
        { title: 'Kế hoạch bảo vệ đồ án', content: 'Chuẩn bị slide 7 trang, tập demo 2 lần và kiểm tra lại file zip trước ngày nộp.' },
        { title: 'Ôn tập React Hooks', content: 'useState, useEffect, useContext, useMemo. Làm lại ví dụ về Context API cho theme sáng/tối.' },
      ],
      'cong-viec': [
        { title: 'Lịch họp nhóm', content: 'Họp sáng thứ Hai lúc 9h00 để chốt công việc Sprint tiếp theo và rà soát bug trên Trello.' },
      ],
      'y-tuong': [
        { title: 'Tính năng mở rộng', content: 'Gắn thẻ (tag) cho ghi chú, xuất ghi chú ra PDF, thêm đăng nhập nhiều người dùng.' },
      ],
    };
    await store.writeJson(topicsPath, topics);
    for (const t of topics) await store.writeJson(topicFile(t.slug), samples[t.slug].map(newNote));
  }
}

module.exports = { ensureData };

if (require.main === module) {
  ensureData().then(() => console.log('Đã khởi tạo dữ liệu mẫu trong thư mục data/'));
}
