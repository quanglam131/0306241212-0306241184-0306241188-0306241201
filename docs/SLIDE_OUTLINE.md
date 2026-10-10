# Dàn ý slide thuyết trình (7 slide + 1 slide QC)

Mỗi slide ngắn gọn, ưu tiên hình ảnh. Thời lượng thường 10-15 phút.

| Slide | Nội dung | Gợi ý hình |
|---|---|---|
| 1 | Tên đề tài, giảng viên, nhóm | |
| 2 | Thành viên và phân công (PM, FE, BE) | Bảng 3 dòng |
| 3 | Công nghệ: ReactJS, Node.js/Express, File System JSON và lý do chọn | Logo công nghệ |
| 4 | Kiến trúc: FE gọi API, BE đọc/ghi file JSON | Sơ đồ 3 khối; ảnh cấu trúc thư mục `backend/data` |
| 5 | Tính năng chính: Cài đặt/Theme, Ghi chú thường, Vùng riêng tư có mật khẩu | Ảnh chụp 3 màn hình (sáng và tối) |
| 6 | Khó khăn và cách giải quyết | Ví dụ bên dưới |
| 7 | Hướng phát triển: đăng nhập nhiều người, MongoDB, xuất PDF | |
| QC | Báo cáo kiểm thử | Bảng số liệu và biểu đồ tròn Pass/Fail |

**Gợi ý nội dung slide 6 (thay bằng khó khăn thật của nhóm):**
- Đồng bộ state theme giữa Settings và toàn app: dùng Context API và CSS variables.
- Bảo vệ vùng riêng tư thật sự (không chỉ ẩn giao diện): token ở server, mã hóa file bằng AES-256-GCM.
- Ghi file JSON khi thao tác dồn dập: ghi qua file tạm và hàng đợi theo từng file.
- Merge conflict khi làm nhóm: chia vùng code, `git pull` trước khi push.

## Slide QC Report (điền SỐ LIỆU THẬT của nhóm)

- Tổng số testcase đã chạy: ___ (xem `TESTCASES.csv`)
- Pass: ___ / ___ (___ %)
- Tổng số bug phát hiện: ___ (giao diện: ___, logic API: ___)
- Tình trạng: đã khắc phục ___ %; kết quả regression test: ___
- Biểu đồ tròn Pass/Fail vẽ từ Google Sheets

## Mẫu Bug Report trên Trello (cột "Bugs - Cần sửa gấp")

```
TIÊU ĐỀ LỖI: [BUG] <mô tả ngắn>
1. Các bước tái hiện (Steps to reproduce):
- ...
2. Kết quả thực tế (Actual Result):
- ...
3. Kết quả mong đợi (Expected Result):
- ...
4. Bằng chứng (Attachments):
- (ảnh chụp màn hình)
Gán thẻ cho FE hoặc BE. Dev sửa xong kéo sang Done, PM test lại (Verify).
```

## Kịch bản Live Demo (khoảng 5 phút)

1. Tổng quan giao diện, đổi Theme Sáng/Tối và màu chủ đạo (thay đổi ngay, bấm Lưu, F5 vẫn giữ).
2. Thêm một ghi chú công khai, sửa, rồi xóa. Tìm kiếm theo từ khóa.
3. Vào Vùng riêng tư: hiện popup, cố tình nhập sai mật khẩu, rồi nhập đúng và xem ghi chú riêng tư.
4. (Nếu còn thời gian) Mở file `private.json` để cho thấy nội dung đã mã hóa.

Phân vai: một người thuyết trình, một người thao tác. Nhập sẵn 3-4 ghi chú nghiêm túc. Tập ít nhất 2 lần.
