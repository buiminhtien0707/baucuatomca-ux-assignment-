# 🎲 BẦU CUA VUI

Website văn hóa–giải trí về **bầu cua tôm cá** — trò chơi Tết dân gian Việt Nam.
Học luật trong 30 giây, chơi bằng **xu ảo 100%** (không nạp, không rút, không tiền thật), soi xác suất ở Lab.

🔗 **Bản live:** https://buiminhtien0707.github.io/baucuatomca-ux-assignment/

---

## ▶️ Chạy local (chọn 1 trong 2 cách)

### Cách 1 — Mở thẳng (dễ nhất)

1. Tải/clone thư mục này về máy
2. **Double-click vào file `HomePage.html`** (hoặc `index.html`)
3. Chạy ngay trên trình duyệt — **không cần cài đặt gì cả**

### Cách 2 — Chạy qua local server (nếu cách 1 có vấn đề)

Cần có [Python](https://www.python.org/downloads/) hoặc VS Code:

```bash
# Python (macOS/Linux/Windows)
cd site
python3 -m http.server 8000
# mở trình duyệt → http://localhost:8000
```

Hoặc trong VS Code: cài extension **Live Server** → chuột phải `index.html` → *Open with Live Server*.

> Website chạy 100% offline — mọi thư viện (Bootstrap), font chữ, ảnh đều nằm sẵn trong thư mục, không cần internet.

---

## 📄 Các trang

| Trang | File | Làm gì |
|-------|------|--------|
| 🏠 Trang chủ | `index.html` | Giới thiệu + hướng dẫn 30 giây + 6 con vật + FAQ |
| 🎮 Chơi | `play.html` | Bàn bầu cua ảo: đặt chip → LẮC! → ăn/thua bằng xu ảo |
| 📖 Học | `learn.html` | Ý nghĩa 6 con vật, nguồn gốc, luật chơi + quiz đổi xu |
| 🧪 Lab | `lab.html` | Mô phỏng 100/1.000 ván — thấy vì sao nhà cầm bát luôn lãi nhẹ |
| 🧧 Tết | `tet.html` | Chuyện ngày Tết với bầu cua + chơi có trách nhiệm |

## ✨ Tính năng

- Đặt cược chip 10/50/100/500 — undo, xóa, đặt lại ván trước
- "Lì xì" +500 xu mỗi ngày (hết xu vẫn chơi tiếp được — không dead-end)
- 8 huy hiệu thu thập, thống kê cá nhân trong **Túi xu** (nút 💰 góc phải)
- 3 ngôn ngữ: **VN / EN / ZH** (chuyển ở góc trên phải)
- Âm thanh tổng hợp trực tiếp bằng Web Audio (không file nhạc)
- Lưu tiến trình tự động (localStorage) — không cần đăng ký tài khoản

## 🛠️ Công nghệ

- HTML5 + CSS3 + JavaScript thuần (không framework, không build tool)
- [Bootstrap 5.3](https://getbootstrap.com) (grid — file local)
- Font: Archivo Black, Be Vietnam Pro, Space Mono (self-hosted woff2)
- Ảnh 6 con vật: [Wikimedia Commons](https://commons.wikimedia.org) (free license)
- Deploy: GitHub Pages

## 📝 Cập nhật code rồi đẩy lên

```bash
git add .
git commit -m "mô tả thay đổi"
git push
```

Push xong GitHub Pages tự cập nhật sau ~1 phút.

---

⚠️ **Lưu ý:** Toàn bộ xu trên website là xu ảo, chỉ để giải trí và học văn hóa. Không có bất kỳ hình thức nạp/rút tiền thật nào.
