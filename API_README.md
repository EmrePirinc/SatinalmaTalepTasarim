# Satınalma API - SQLite Backend

localStorage yerine SQLite veritabanı ile çalışan REST API.

## 🚀 Başlangıç

### 1. Backend'i Başlat
```bash
npm run server
```
Server http://localhost:3001 adresinde çalışacak.

### 2. Frontend'i Başlat (ayrı terminal)
```bash
npm run dev
```
Frontend http://localhost:5173 adresinde çalışacak.

### 3. Her İkisini Birden Başlat
```bash
npm run dev:full
```

## 📊 Veritabanı

SQLite veritabanı: `server/database/satinalma.db`

### Tablolar:

**users** - Kullanıcılar
- `id`, `sap_id`, `username`, `password`, `name`, `role`
- `purchase_authority`, `finance_authority`, `status`

**purchase_requests** - SAT B1 OPRQ tablosuna uygun
- `id`, `doc_num`, `tax_date`, `req_date`, `doc_due_date`
- `doc_date`, `req_name`, `department`, `status`
- `u_acil_mi`, `u_talep_ozeti`, `u_revize_nedeni`, `u_red_nedeni`
- `comments`, `notes`

**request_items** - SAP B1 PRQ1 tablosuna uygun
- `id`, `request_id`, `ocr_code`, `item_code`, `item_name`
- `pqt_regdate`, `quantity`, `uom_code`, `vendor_code`, `free_txt`

## 🔗 API Endpoints

### Auth
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/users` - Tüm kullanıcıları listele
- `POST /api/auth/users` - Yeni kullanıcı ekle
- `PUT /api/auth/users/:id` - Kullanıcı güncelle

### Requests
- `GET /api/requests` - Tüm talepleri listele (rolüne göre filtrelenir)
- `POST /api/requests` - Yeni talep oluştur
- `PUT /api/requests/:id` - Talep güncelle
- `GET /api/requests/next-doc-number` - Sonraki doküman numarasını al

### Health
- `GET /api/health` - Server durumu kontrolü

## 👤 Demo Kullanıcılar

| Kullanıcı Adı | Şifre | Rol | SAP ID |
|---------------|-------|-----|---------|
| user1 | 1234 | user | SAP003 |
| satinalma | 1234 | purchaser | SAP002 |
| admin | 1234 | admin | SAP001 |
| user2 | 1234 | user | SAP004 |
| finans | 1234 | purchaser | SAP005 |

## ✅ Tamamlanan İşlemler

- ✅ SQLite veritabanı oluşturuldu
- ✅ Express backend API kuruldu
- ✅ Auth endpoints (login, users CRUD)
- ✅ Purchase requests endpoints
- ✅ Frontend API service katmanı
- ✅ Login sayfası API entegrasyonu

## 🔄 Kalan İşlemler

- ⏳ Task form API entegrasyonu
- ⏳ Talep listesi API entegrasyonu
- ⏳ Admin sayfası API entegrasyonu

## 📝 Notlar

- Veritabanı otomatik oluşturulur (ilk çalıştırmada)
- Demo kullanıcılar otomatik eklenir
- SAP B1 alan isimlendirmelerine uygun yapı
- CORS aktif (tüm origin'lere açık - production'da değiştirilmeli)
