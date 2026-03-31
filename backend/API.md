# API Routes

## Auth
- GET /login: Trang dang nhap.
- POST /login: Xu ly dang nhap hoc sinh bang account (ho tro username cu de tuong thich).
- GET /change-password: Trang doi mat khau lan dau.
- POST /change-password: Cap nhat mat khau moi.
- POST /logout: Dang xuat.

## Student
- GET /dashboard: Hien thong tin hoc sinh, diem 5 mon va top 3 tung mon.

## Admin
- GET /admin/create-student: Trang tao tai khoan hoc sinh san.
- POST /admin/create-student: Tao hoc sinh moi voi:
  - username = HoTenKhongDau
  - account = username
  - password mac dinh = username
  - must_change_password = true
  - diem 5 mon mac dinh = 0

## Du lieu
- He thong su dung 1 bang duy nhat: `public.result`
- Cot chinh: full_name, class_name, dob, username, account, password_hash, must_change_password, toan, li, hoa, tieng_anh, van

## Ghi chu kien truc
- Moi tinh nang co 3 file rieng:
  - login: backend/features/login/api.js, backend/features/login/service.js, backend/features/login/model.js
  - change-password: backend/features/change-password/api.js, backend/features/change-password/service.js, backend/features/change-password/model.js
  - dashboard: backend/features/dashboard/api.js, backend/features/dashboard/service.js, backend/features/dashboard/model.js
  - admin-create-student: backend/features/admin-create-student/api.js, backend/features/admin-create-student/service.js, backend/features/admin-create-student/model.js
  - home: backend/features/home/api.js, backend/features/home/service.js, backend/features/home/model.js
  - logout: backend/features/logout/api.js, backend/features/logout/service.js, backend/features/logout/model.js
