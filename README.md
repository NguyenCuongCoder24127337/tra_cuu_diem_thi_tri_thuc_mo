# Web Tra Cuu Diem Thi (Supabase)

## Cau truc project

Root chi co 2 thu muc lon:
- backend
- frontend

### Backend (khong chong cheo chuc nang)
- backend/features/login/{api.js, service.js, model.js}
- backend/features/change-password/{api.js, service.js, model.js}
- backend/features/dashboard/{api.js, service.js, model.js}
- backend/features/admin-create-student/{api.js, service.js, model.js}
- backend/features/home/{api.js, service.js, model.js}
- backend/features/logout/{api.js, service.js, model.js}
- backend/core: thanh phan dung chung (session auth, app factory, supabase client).
- backend/server.js: diem chay app va nap env.
- backend/supabase/schema.sql: SQL tao bang.

### Frontend
- frontend/ui/<feature>/<feature>.ejs: moi man hinh mot thu muc rieng.
- frontend/ui/shared: giao dien dung chung.
- frontend/public: CSS va anh (logo_web.jpg, homepage_web.jpg).

## Chuc nang
- Dang nhap hoc sinh bang account va password.
- Mat khau mac dinh duoc nha truong tao san.
- Lan dang nhap dau tien bat buoc doi mat khau.
- Admin co trang tao tai khoan hoc sinh san tren web.
- Hien diem 5 mon: Toan, Ly, Hoa, Tieng Anh, Van.
- Neu khong co data diem, he thong hien 0.
- Hien top 3 hoc sinh diem cao nhat theo tung mon.

## 1) Cai dat
```bash
cd backend
npm install
```

## 2) Cau hinh moi truong
Tao file backend/.env theo mau backend/.env.example:
```env
PORT=3000
SESSION_SECRET=change-me-in-production
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Tai lieu route API xem tai: backend/API.md

## 3) Tao bang trong Supabase
- Mo SQL Editor trong Supabase.
- Chay file: backend/supabase/schema.sql

## 4) Du lieu mau
- He thong dung 1 bang duy nhat: result.
- Bang result luu thong tin hoc sinh + tai khoan + diem 5 mon.

Vi du insert 1 hoc sinh:
```sql
insert into public.result(
  full_name, class_name, dob, username, account, password_hash, must_change_password,
  toan, li, hoa, tieng_anh, van
)
values (
  'Nguyen Tien Cuong',
  '12A15',
  '2008-01-02',
  'NguyenTienCuong',
  'NguyenTienCuong',
  '$2b$10$replace_with_real_hash',
  true,
  8.5, 7.75, 8.0, 9.0, 8.25
);
```

## 5) Tao tai khoan hoc sinh san (admin thuc hien)
- Cach 1 (khuyen nghi): vao trang http://localhost:3000/admin/create-student va tao truc tiep.
- Cach 2: tu insert SQL nhu ben duoi.

Trang admin se tu dong:
- Sinh username theo quy tac: HoTenKhongDau.
- Set account = username.
- Dat password mac dinh = username.
- Hash password truoc khi luu vao Supabase.
- Tao diem mac dinh 0 cho 5 mon trong result.

Vi du hash nhanh tren Node REPL:
```bash
node -e "require('bcrypt').hash('NguyenTienCuong',10).then(console.log)"
```

## 6) Chay ung dung
```bash
cd backend
npm run dev
```
- Trang chu: http://localhost:3000
- Dang nhap: http://localhost:3000/login

## Import du lieu tu XLSX vao Supabase
- Cot thong tin hoc sinh va diem deu nam trong bang result.
- Chuan bi file xlsx co it nhat cac cot:
  - ho_va_ten (hoac full_name)
  - lop (hoac class_name)
  - ngay_sinh (hoac dob)
  - toan, li, hoa, tieng_anh, van (neu de trong se mac dinh 0)
- Cai them thu vien moi:
```bash
cd backend
npm install
```
- Chay import:
```bash
cd backend
npm run import:xlsx -- "duong-dan-file.xlsx"
```
- Rule merge du lieu import: neu trung ho ten + trung lop thi gom vao 1 hoc sinh va ghep diem 5 mon tren cung 1 dong.
- Vi du:
```bash
npm run import:xlsx -- "D:/web_tra_cuu_diem_thi/data/diem_hoc_sinh.xlsx"
```

## 7) Anh giao dien
- Logo: frontend/public/logo_web.jpg
- Homepage banner: frontend/public/homepage_web.jpg

Hai anh nay dang duoc su dung truc tiep trong giao dien.
