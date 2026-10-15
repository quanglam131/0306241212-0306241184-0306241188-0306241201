# ĐỒ ÁN MÔN HỌC: ỨNG DỤNG QUẢN LÝ GHI CHÚ VÀ THÔNG TIN RIÊNG TƯ (REACTJS & NODEJS)

**Giáo viên hướng dẫn:** Nguyễn Hoàng Việt
**Nhóm thực hiện:** Nhóm CLHD

**Thành viên:**

| STT | Họ tên | MSSV | Vai trò |
|---|---|---|---|
| 1 | Võ Quang Lam | 0306241212 | PM & QA |
| 2 | Lê Phú Cường | 0306241184 | Frontend Developer |
| 3 | Nguyễn Tiến Dũng | 0306241188 | Backend Developer |
| 4 | Lương Võ Khôi Hùng | 0306241201 | Backend Developer |

## 1. Giới thiệu

Ứng dụng web Single Page Application giúp ghi chép, phân loại ghi chú theo chủ đề và lưu thông tin nhạy cảm
trong **vùng riêng tư được khóa bằng mật khẩu**. Hệ thống **không dùng database**: toàn bộ dữ liệu lưu thành các
file `.json` ở thư mục `backend/data/`.

### Chức năng chính

- **Cài đặt:** tên hiển thị, giao diện Sáng/Tối, màu chủ đạo (áp dụng ngay, bấm *Lưu* để ghi vào file), đổi mật khẩu vùng riêng tư.
- **Ghi chú thường:** thêm / xem chi tiết / sửa / xóa; quản lý **chủ đề** (tạo, đổi tên, xóa); **tìm kiếm** theo từ khóa trong tiêu đề hoặc nội dung (tìm trên tất cả chủ đề).
- **Vùng riêng tư:** lần đầu phải đặt mật khẩu; mỗi lần vào tab đều hiện popup nhập mật khẩu; CRUD ghi chú nhạy cảm; rời tab hoặc F5 là khóa lại.
- **Trải nghiệm:** responsive (desktop và điện thoại), spinner khi đọc/ghi, thông báo (toast) khi thành công hoặc thất bại.

## 2. Công nghệ sử dụng

- **Frontend:** ReactJS 18 (Vite), React Router DOM, Context API (state toàn cục: theme, màu, tên, chủ đề).
- **Backend:** Node.js, Express.js, bcryptjs (băm mật khẩu), module `crypto` (mã hóa AES-256-GCM).
- **Lưu trữ:** File System (JSON) – dễ quản lý, không cần cài database.

## 3. Yêu cầu môi trường

- Máy tính cài sẵn **Node.js phiên bản 18 trở lên** (kiểm tra bằng `node -v`). Vite 5 yêu cầu Node 18+.
- Trình duyệt khuyến nghị: Google Chrome hoặc Microsoft Edge.
- Cần kết nối Internet ở lần chạy `npm install` đầu tiên.

## 4. Hướng dẫn cài đặt và chạy dự án

Dự án gồm 2 phần chạy độc lập. Mở **2 cửa sổ Terminal** (Command Prompt) để chạy song song.

### Bước 1: Khởi động Backend (máy chủ API)

```bash
cd backend
npm install
npm start
```

Backend chạy tại **http://localhost:5000**. Lần chạy đầu tiên, hệ thống **tự tạo** thư mục `data/`
cùng dữ liệu mẫu (3 chủ đề và vài ghi chú). Khi thấy dòng `Backend chạy tại http://localhost:5000` là thành công.

### Bước 2: Khởi động Frontend (giao diện)

Mở Terminal thứ hai:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại **http://localhost:5173** (nếu cổng bận, xem địa chỉ hiển thị trên Terminal; lệnh `npm start` cũng chạy được).
Mở địa chỉ này bằng trình duyệt. Frontend tự chuyển tiếp mọi yêu cầu `/api` sang Backend nên **không cần cấu hình thêm**.

> Chạy nhanh từ thư mục gốc: `npm run install:all` (cài cả hai phần), sau đó `npm run start:backend` và `npm run start:frontend` ở hai Terminal.

## 5. Tài khoản / Mật khẩu demo

- Web **không yêu cầu đăng nhập tài khoản**.
- **Vùng riêng tư** (menu bên trái) yêu cầu mật khẩu. Lần đầu bấm vào, hệ thống hiện popup **thiết lập mật khẩu**
  (tối thiểu 4 ký tự). Có thể đặt hoặc đổi mật khẩu ở menu **Cài đặt**.
- Muốn thử lại từ đầu: tắt Backend, xóa thư mục `backend/data`, chạy lại Backend (dữ liệu mẫu được tạo lại).

> Lưu ý: dữ liệu riêng tư được mã hóa bằng chính mật khẩu của bạn nên **quên mật khẩu thì không thể khôi phục**.

## 6. Cấu trúc thư mục

```
do-an-ghi-chu/
├── README.md
├── package.json              # script tiện ích chạy từ thư mục gốc
├── scripts/clean.js          # xóa node_modules trước khi nén zip
├── docs/                     # API.md, TESTCASES.csv, SLIDE_OUTLINE.md
├── backend/
│   ├── server.js             # điểm khởi chạy Express
│   ├── src/
│   │   ├── routes/           # profile, topics, notes, private
│   │   ├── services/         # đọc/ghi file, mã hóa, phiên mở khóa, nghiệp vụ
│   │   ├── middleware/       # requireSession (chặn API riêng tư khi chưa mở khóa)
│   │   ├── utils/            # validate, slug, HttpError
│   │   └── seed.js           # tự tạo dữ liệu mẫu nếu thiếu
│   └── data/                 # DỮ LIỆU JSON - vui lòng không xóa khi đang chạy
│       └── users/default/
│           ├── profile.json  # tên, theme, màu, hash mật khẩu (bcrypt)
│           ├── private.json  # ghi chú riêng tư (đã mã hóa AES-256-GCM)
│           ├── topics.json   # danh sách chủ đề
│           └── notes/<chu-de>.json
└── frontend/
    ├── index.html, vite.config.js
    └── src/
        ├── api/client.js     # toàn bộ lời gọi API
        ├── context/          # AppContext (theme, màu, chủ đề), ToastContext
        ├── components/       # Layout, Modal, NoteManager (dùng chung), ...
        └── pages/            # NotesPage, PrivatePage, SettingsPage
```

[CLHD.pdf](https://github.com/user-attachments/files/33326996/CLHD.pdf)

Ví dụ `profile.json`:

```json
{
  "displayName": "Tiến",
  "preferences": { "theme": "dark", "primaryColor": "#ff5722" },
  "privatePasswordHash": "$2a$10$..."
}
```

Ví dụ `notes/cong-viec.json`:

```json
[
  {
    "id": "b1c6...-uuid",
    "title": "Lịch họp dự án",
    "content": "Họp vào sáng thứ 2 lúc 9h00...",
    "createdAt": "2026-09-10T08:00:00.000Z",
    "updatedAt": "2026-09-10T08:00:00.000Z"
  }
]
```

## 7. Bảo mật

- Mật khẩu **không lưu dạng nguyên bản**: băm bằng bcrypt trong `profile.json`, không bao giờ trả về giao diện.
- `private.json` được **mã hóa AES-256-GCM**, khóa sinh từ mật khẩu bằng scrypt kèm salt riêng. Mở file bằng trình soạn thảo chỉ thấy chuỗi mã hóa.
- API `/api/private/notes` **yêu cầu token** cấp sau khi nhập đúng mật khẩu (giữ trong bộ nhớ, hết hạn sau 15 phút không thao tác). Gọi API trực tiếp khi chưa mở khóa sẽ nhận lỗi 401.
- Nhập sai mật khẩu 5 lần liên tiếp sẽ bị tạm khóa 60 giây.
- Tên chủ đề được chuẩn hóa thành slug an toàn để chặn tấn công đường dẫn (`../`).
- File JSON được ghi qua file tạm rồi đổi tên và xếp hàng theo từng file, tránh hỏng dữ liệu khi thao tác dồn dập.

## 8. API tóm tắt

Chi tiết xem `docs/API.md`.

| Nhóm | Endpoint |
|---|---|
| Profile | `GET/PUT /api/profile` |
| Chủ đề | `GET/POST /api/topics`, `PUT/DELETE /api/topics/:slug` |
| Ghi chú thường | `GET/POST /api/notes/:topic`, `PUT/DELETE /api/notes/:topic/:id`, `GET /api/notes/search?q=` |
| Riêng tư | `GET /api/private/status`, `POST /api/private/setup`, `POST /api/private/auth`, `POST /api/private/lock`, `POST /api/private/change-password`, `GET/POST /api/private/notes`, `PUT/DELETE /api/private/notes/:id` |

## 9. Kiểm thử

Bộ testcase mẫu nằm ở `docs/TESTCASES.csv` (mở bằng Excel hoặc import vào Google Sheets).
Quy trình báo lỗi: tạo card ở cột **Bugs** trên Trello theo mẫu trong `docs/SLIDE_OUTLINE.md`.

## 10. Xử lý sự cố thường gặp

| Hiện tượng | Cách xử lý |
|---|---|
| Giao diện báo "Không tải được dữ liệu" | Backend chưa chạy. Mở Terminal, vào `backend` rồi chạy `npm start` |
| `EADDRINUSE` (cổng 5000 đang bận) | Đóng chương trình đang dùng cổng 5000, hoặc chạy `PORT=5001 npm start` rồi sửa `target` trong `frontend/vite.config.js` |
| `npm install` lỗi mạng | Kiểm tra Internet, thử lại; xóa `node_modules` rồi cài lại |
| Quên mật khẩu vùng riêng tư | Không khôi phục được. Xóa `backend/data/users/default/private.json` và đặt `privatePasswordHash` thành `null` trong `profile.json` (mất ghi chú riêng tư cũ) |

## 11. Hướng phát triển

Đăng nhập nhiều người dùng (cấu trúc `data/users/<id>/` đã sẵn sàng), thêm database (MongoDB), gắn thẻ và xuất PDF, sao lưu dữ liệu.

> **Ghi chú:** Hệ thống dùng file JSON để lưu dữ liệu tại thư mục `backend/data`, vui lòng không xóa thư mục này khi đang chạy ứng dụng.
