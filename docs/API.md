# Tài liệu API

Địa chỉ gốc: `http://localhost:5000/api`. Mọi phản hồi là JSON. Lỗi luôn có dạng `{ "message": "..." }`.

| Mã | Ý nghĩa |
|---|---|
| 400 | Dữ liệu gửi lên không hợp lệ (ví dụ thiếu tiêu đề) |
| 401 | Sai mật khẩu, hoặc vùng riêng tư đang khóa / hết phiên |
| 404 | Không tìm thấy chủ đề hoặc ghi chú |
| 409 | Trùng dữ liệu (chủ đề đã tồn tại, mật khẩu đã thiết lập) |
| 429 | Nhập sai mật khẩu quá nhiều lần (kèm `retryAfter` giây) |

## Profile

**GET /profile**
```json
{ "displayName": "Tiến", "preferences": { "theme": "dark", "primaryColor": "#ff5722" }, "hasPrivatePassword": true }
```

**PUT /profile** – chỉ gửi trường cần đổi (dữ liệu được gộp, không ghi đè cả file)
```json
{ "displayName": "Tiến", "preferences": { "theme": "dark", "primaryColor": "#ff5722" } }
```
`theme`: `light` hoặc `dark`. `primaryColor`: dạng `#RRGGBB`.

## Chủ đề

| Method | URL | Body | Ghi chú |
|---|---|---|---|
| GET | /topics | | `[{ slug, name, createdAt, noteCount }]` |
| POST | /topics | `{ "name": "Du lịch" }` | 201, slug sinh tự động (`du-lich`) |
| PUT | /topics/:slug | `{ "name": "Đi chơi" }` | Đổi tên hiển thị |
| DELETE | /topics/:slug | | Xóa chủ đề và toàn bộ ghi chú bên trong |

## Ghi chú thường

Đối tượng ghi chú: `{ id, title, content, createdAt, updatedAt }`.

| Method | URL | Body | Ghi chú |
|---|---|---|---|
| GET | /notes/:topic | | Mới cập nhật xếp trước |
| GET | /notes/search?q=từ-khóa | | Tìm trong tiêu đề và nội dung, mọi chủ đề; mỗi kết quả có thêm `topic`, `topicName` |
| POST | /notes/:topic | `{ "title": "...", "content": "..." }` | 201. `title` bắt buộc, không được toàn dấu cách |
| PUT | /notes/:topic/:id | `{ "title": "...", "content": "..." }` | Cập nhật `updatedAt` |
| DELETE | /notes/:topic/:id | | |

## Vùng riêng tư

Các API ghi chú riêng tư cần header `Authorization: Bearer <token>`.

| Method | URL | Body | Kết quả |
|---|---|---|---|
| GET | /private/status | | `{ "hasPassword": true }` |
| POST | /private/setup | `{ "password": "..." }` | Lần đầu đặt mật khẩu. 201, `{ success, token }` |
| POST | /private/auth | `{ "password": "..." }` | `{ success: true, token }` hoặc 401 `Sai mật khẩu` |
| POST | /private/lock | | Hủy phiên hiện tại |
| POST | /private/change-password | `{ "oldPassword": "...", "newPassword": "..." }` | Mã hóa lại dữ liệu, hủy mọi phiên |
| GET | /private/notes | | Danh sách ghi chú đã giải mã |
| POST | /private/notes | `{ title, content }` | 201 |
| PUT | /private/notes/:id | `{ title, content }` | |
| DELETE | /private/notes/:id | | |

## Thử nhanh bằng curl

```bash
curl http://localhost:5000/api/topics
curl -X POST http://localhost:5000/api/notes/hoc-tap -H "Content-Type: application/json" -d '{"title":"Thử API","content":"Xin chào"}'
curl http://localhost:5000/api/private/notes          # -> 401 khi chưa có token
```
