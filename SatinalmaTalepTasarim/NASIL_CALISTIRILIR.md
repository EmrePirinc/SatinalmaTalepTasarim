# Satınalma Talep Sistemi - Kurulum ve Çalıştırma Rehberi

## 📋 Gereksinimler

- **Node.js**: v18 veya üzeri
- **npm**: v9 veya üzeri

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

Bu komut hem **frontend** (React) hem de **backend** (Express + SQLite) için gerekli tüm paketleri yükleyecektir.

## ▶️ Projeyi Çalıştırma

### Seçenek 1: Hem Frontend Hem Backend (Önerilen)

```bash
npm run dev:full
```

Bu komut aynı anda şunları başlatır:
- **Frontend**: http://localhost:3000 (Vite Dev Server)
- **Backend**: http://localhost:3001 (Express Server)

### Seçenek 2: Sadece Frontend

```bash
npm run dev
```

- Frontend: http://localhost:3000
- **Not**: Backend çalışmadan bazı özellikler çalışmayacaktır.

### Seçenek 3: Sadece Backend

```bash
npm run server
```

- Backend: http://localhost:3001
- API endpoints: http://localhost:3001/api/*

## 🗂️ Proje Yapısı

```
SatinalmaTalepTasarim/
├── src/                    # Frontend kaynak kodları
│   ├── components/         # React bileşenleri
│   ├── pages/             # Sayfa bileşenleri
│   ├── services/          # API servisleri
│   ├── lib/               # Yardımcı fonksiyonlar
│   └── utils/             # Utility fonksiyonları
│
├── server/                # Backend kaynak kodları
│   ├── routes/            # API route'ları
│   ├── database/          # SQLite database
│   └── data/              # Örnek veri dosyaları
│
├── public/                # Statik dosyalar
└── package.json           # Proje bağımlılıkları
```

## 🔐 Giriş Bilgileri

### Admin Kullanıcısı
- **Kullanıcı Adı**: `admin`
- **Şifre**: `admin123`

### Normal Kullanıcı
- **Kullanıcı Adı**: `user`
- **Şifre**: `user123`

## 🛠️ Diğer Komutlar

### Production Build Oluşturma

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

### Build'i Önizleme

```bash
npm run preview
```

### Kod Kalitesi Kontrolü

```bash
npm run lint
```

## 📡 API Endpoints

Backend şu adreste çalışır: `http://localhost:3001/api`

### Kimlik Doğrulama
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/users` - Tüm kullanıcıları listele
- `POST /api/auth/users` - Yeni kullanıcı oluştur
- `PUT /api/auth/users/:id` - Kullanıcı güncelle

### Talepler
- `GET /api/requests` - Tüm talepleri listele
- `POST /api/requests` - Yeni talep oluştur
- `PUT /api/requests/:id` - Talep güncelle
- `GET /api/requests/next-doc-number` - Sonraki belge numarasını al
- `POST /api/requests/load-sample-data` - Örnek veri yükle

### Sistem
- `GET /api/health` - Sistem sağlık kontrolü

## 🐛 Sorun Giderme

### Port Zaten Kullanımda Hatası

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID_NUMARASI> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Backend (Port 3001):**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID_NUMARASI> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Database Hatası

Eğer database ile ilgili hata alırsanız:

```bash
# Database dosyasını silin ve yeniden başlatın
rm server/database/satinalma.db
npm run server
```

### Node Modules Hatası

```bash
# node_modules klasörünü ve package-lock.json'u silin
rm -rf node_modules package-lock.json

# Yeniden yükleyin
npm install
```

## 📝 Notlar

- İlk çalıştırmada database otomatik olarak oluşturulacaktır
- Örnek veri yüklemek için Admin panelinden "Örnek Veri Yükle" butonunu kullanabilirsiniz
- Tüm veriler `server/database/satinalma.db` dosyasında SQLite formatında saklanır

## 🔧 Geliştirme

### Hot Reload

- **Frontend**: Kod değişikliklerinde otomatik yenilenir
- **Backend**: Manuel yeniden başlatma gerekir

### TypeScript

Proje TypeScript kullanır. Type kontrolü için:

```bash
npx tsc --noEmit
```

## 📚 Teknolojiler

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router
- React Hook Form
- Zod (Validation)

### Backend
- Express.js
- Better-SQLite3
- CORS
- Body-Parser

---

**Profesör ile geliştirildi** ✨

