# Satınalma Talep Tasarım

Modern satınalma talep yönetim sistemi - React, TypeScript ve Vite ile geliştirildi.

[![Deployed on GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://emrepirinc.github.io/SatinalmaTalepTasarim/)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## 🚀 Canlı Demo

Uygulama şu adreste yayında:

**[https://emrepirinc.github.io/SatinalmaTalepTasarim/](https://emrepirinc.github.io/SatinalmaTalepTasarim/)**

## 📋 Özellikler

- Modern ve responsive kullanıcı arayüzü
- Rol bazlı yetkilendirme sistemi (Admin, Talep Eden, Satınalmacı, Muhasebe)
- Talep oluşturma ve takip sistemi
- SAP entegrasyon desteği
- Excel export özelliği
- Sayfalama ve filtreleme
- Detaylı popup görünümleri
- Dosya yükleme ve indirme

## 🛠️ Teknolojiler

- **Framework:** React 18
- **Build Tool:** Vite 5
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **Icons:** Lucide React
- **Excel Export:** xlsx

## 💻 Kurulum

### Gereksinimler

- Node.js 20 veya üzeri
- npm

### Adımlar

1. Repoyu klonlayın:
```bash
git clone https://github.com/emrepirinc/SatinalmaTalepTasarim.git
cd SatinalmaTalepTasarim
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışmaya başlayacaktır.

## 📦 Build

Production build oluşturmak için:

```bash
npm run build
```

Build çıktısı `dist/` klasöründe oluşturulacaktır.

Local'de preview için:

```bash
npm run preview
```

## 🚢 Deployment

Proje GitHub Pages üzerinde otomatik olarak deploy edilmektedir. `react` branch'ine yapılan her push, GitHub Actions workflow'u tarafından otomatik olarak deploy edilir.

Workflow dosyası: `.github/workflows/deploy.yml`

## 🔧 Geliştirme

### Dizin Yapısı

```
src/
├── components/     # React bileşenleri
├── lib/           # Yardımcı fonksiyonlar
├── types/         # TypeScript tip tanımları
└── main.tsx       # Uygulama giriş noktası
```

### Branch Stratejisi

- `react`: Ana geliştirme ve production branch'i
- Tüm değişiklikler doğrudan `react` branch'ine push edilir

## 📝 Demo Kullanıcılar

Uygulama test için hazır demo kullanıcılar içermektedir:
- Admin
- Talep Eden
- Satınalmacı
- Muhasebe

## 📄 Lisans

Bu proje özel bir projedir.

## 👤 Geliştirici

Emre Pirinç - [@emrepirinc](https://github.com/emrepirinc)
