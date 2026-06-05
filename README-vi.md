[🇻🇳 Đọc bằng Tiếng Việt](./README-vi.md) | [🇺🇸 Read in English](./README.md)

# 🚀 Instagram Auto Username Checker

Một công cụ (Userscript) chạy qua Tampermonkey giúp tự động kiểm tra, sinh ngẫu nhiên và săn tên người dùng (username) siêu đẹp trên Instagram.

## ⚙️ Cài Đặt Nhanh (1-Click Install)

**Bước 1:** Cài đặt tiện ích [Tampermonkey](https://www.tampermonkey.net/) cho trình duyệt của bạn (Chrome, Edge, Cốc Cốc...).

**Bước 2:** Bấm vào nút màu xanh bên dưới để tự động cài đặt mã script:

[![Cài đặt Script](https://img.shields.io/badge/Cài_đặt_Userscript-2ecc71?style=for-the-badge&logo=tampermonkey)](DÁN_LINK_RAW_CỦA_BẠN_VÀO_ĐÂY)

---

## ✨ Tính Năng Nổi Bật
- **Tự Động Sinh Tên (Auto Gen):** Tạo ngẫu nhiên các username dựa trên bảng chữ cái, số, dấu chấm `.` và gạch dưới `_`. Phối hợp hàng tỷ tỷ cách khác nhau!
- **Dùng Danh Sách Tự Chọn:** Hỗ trợ tải thẳng file `.txt` lên để check list tên bạn đã chuẩn bị sẵn.
- **Vượt Rào CSP (Bypass CSP):** Sử dụng quyền năng `GM_xmlhttpRequest` để đâm xuyên qua hệ thống bảo mật của nền tảng, cho phép giao tiếp ra ngoài.
- **Thông Báo Qua Telegram:** Khi săn được tên thành công hoặc khi chạy xong vòng lặp, tool tự động gửi thông báo và bắn thẳng file `.txt` báo cáo về Bot Telegram của bạn.
- **Giả Lập Người Thật (Jitter Delay):** Có cơ chế tự cộng dồn độ trễ ngẫu nhiên vào các lần check để tránh bị hệ thống quét spam (Rate Limit) chặn.

## 📝 Hướng Dẫn Sử Dụng
1. Truy cập vào trang quản lý Trung Tâm Tài Khoản (Accounts Center) của Meta phần đổi Username.
2. Bảng điều khiển (UI) của tool sẽ tự động hiện lên ở góc dưới cùng bên phải màn hình.
3. Chọn chế độ chạy, cài đặt số lượng/độ dài và bấm **▶ Bắt đầu**.
