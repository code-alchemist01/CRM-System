# Frontend - CRM System

React + TypeScript + Ant Design tabanlı modern web arayüzü.

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### 3. Development Server'ı Başlatın

```bash
npm run dev
```

Frontend `http://localhost:5173` adresinde çalışacaktır.

## Özellikler

### Sayfalar
- **Dashboard** - Genel bakış ve istatistikler
- **Müşteriler** - Müşteri listesi ve yönetimi
- **Satış Fırsatları** - Kanban board görünümü
- **Görevler** - Görev listesi ve yönetimi
- **Faturalar** - Fatura listesi ve PDF export

### Özellikler
- Çoklu dil desteği (TR/EN)
- Responsive tasarım
- Gerçek zamanlı güncellemeler
- Form validasyonu
- Arama ve filtreleme

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Production preview
npm run lint         # ESLint kontrolü
```

## Yapı

```
src/
├── features/        # Sayfa bileşenleri
│   ├── auth/       # Giriş sayfası
│   ├── dashboard/  # Dashboard
│   ├── customers/  # Müşteriler
│   ├── opportunities/ # Satış fırsatları
│   ├── tasks/      # Görevler
│   └── invoices/   # Faturalar
├── components/     # Yeniden kullanılabilir bileşenler
│   └── layout/     # Layout bileşenleri
├── store/          # Redux store
│   ├── slices/     # Redux slices
│   └── api/        # RTK Query API
├── locales/        # Çeviri dosyaları
│   ├── tr/         # Türkçe
│   └── en/         # İngilizce
└── utils/          # Yardımcı fonksiyonlar
```

## Kullanılan Kütüphaneler

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Ant Design** - UI components
- **Redux Toolkit** - State management
- **React Router** - Routing
- **React i18next** - Internationalization
- **Axios** - HTTP client
- **Vite** - Build tool

## Geliştirme

### Yeni Sayfa Ekleme

1. `src/features/` altında yeni klasör oluşturun
2. Component dosyasını ekleyin
3. `src/App.tsx` içinde route ekleyin
4. `src/components/layout/Layout.tsx` içinde menü item ekleyin

### Çeviri Ekleme

1. `src/locales/tr/translation.json` dosyasına ekleyin
2. `src/locales/en/translation.json` dosyasına ekleyin
3. Component içinde `useTranslation` hook'unu kullanın

