- Tên: Khuất Quốc Khánh
- MSSV: 23711381
- Lớp: KHDL19B


Tech:

Backend
+ FastAPI
+ SQLAlchemy
+ Pydantic
+ python-multipart
+ Pandas

Frontend:
+ React Js
+ Axios
+ Lucide React

Database
+ SQlite

Tools:
+ Gemini
+ Cursor AI
+ Git
+ Github

Log:

## version 1:
Backend: Thiết lập cấu trúc cơ bản với các file database.py, main.py, models.py, schemas.py.
Frontend: Xây dựng giao diện cơ bản (index.html, App.css, App.jsx) với các component chính.
Chức năng: Thực hiện thành công CRUD (Thêm, Xem, Sửa, Xóa) sinh viên qua API. Hiển thị danh sách sinh viên dưới dạng bảng đơn giản.
Hạn chế: Chưa có các tính năng lọc, thống kê và xuất dữ liệu.

## version 2:
Nâng cấp Backend: * Mở rộng Database: Thêm bảng Class (Lớp học) và thiết lập quan hệ (Relationship) với bảng Sinh viên.
Thêm trường dữ liệu Năm sinh cho sinh viên.
Xây dựng API Statistics: Tự động tính toán tổng số lượng sinh viên và điểm GPA trung bình.
Xây dựng API Export: Tích hợp thư viện Pandas để xuất dữ liệu sinh viên ra file .csv.
Nâng cấp Frontend: * Tìm kiếm thông minh: Thêm thanh tìm kiếm theo Mã số sinh viên (MSSV) với nút bấm xác nhận.
Dashboard: Thêm các thẻ hiển thị thống kê nhanh trên đầu trang.
Thông báo thông minh: Hiển thị dòng trạng thái "Không tìm thấy sinh viên" khi kết quả tìm kiếm trống.
Cải thiện UI/UX: Chuyển đổi từ chọn lớp sang nhập trực tiếp mã lớp, tự động hóa việc khởi tạo lớp học mới trong hệ thống.
Hoàn thiện: Kiểm thử toàn bộ (End-to-End), sửa lỗi xung đột dữ liệu và đẩy code lên GitHub.
