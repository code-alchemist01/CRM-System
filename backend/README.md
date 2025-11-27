# Backend - CRM System

NestJS tabanlı RESTful API backend servisi.

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin ve veritabanı, Redis, JWT ayarlarını yapın:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=CrmNew

# Redis (opsiyonel)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# SMTP (E-posta gönderme için - detaylı bilgi için SMTP_SETUP.md'ye bakın)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Veritabanını Hazırlayın

PostgreSQL'de veritabanını oluşturun:

```sql
CREATE DATABASE "CrmNew";
```

### 4. Migration ve Seed Çalıştırın

```bash
npm run seed
```

Bu komut:
- Veritabanı tablolarını oluşturur
- İlk tenant'ı ekler
- Admin kullanıcısını oluşturur

### 5. Sunucuyu Başlatın

```bash
npm run start:dev
```

Backend `http://localhost:3000` adresinde çalışacaktır.

## SMTP E-posta Ayarları

E-posta göndermek için SMTP ayarlarını yapılandırmanız gerekir. Detaylı bilgi için [SMTP_SETUP.md](./SMTP_SETUP.md) dosyasına bakın.

Kısa özet:
1. Gmail kullanıyorsanız, Google Hesabınızdan "App Password" oluşturun
2. `backend/.env` dosyasına SMTP ayarlarınızı ekleyin:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
3. Backend'i yeniden başlatın

## PDF Font Kurulumu

PDF export özelliği için DejaVu Sans font dosyası gereklidir:

```bash
# Otomatik indirme
powershell -ExecutionPolicy Bypass -File scripts/download-font.ps1
```

Veya manuel olarak:
1. https://dejavu-fonts.github.io/ adresinden `DejaVuSans.ttf` indirin
2. `assets/fonts/` klasörüne kopyalayın

## API Endpoints

### Authentication
- `POST /auth/login` - Giriş yap
- `POST /auth/register` - Kayıt ol
- `POST /auth/refresh` - Token yenile
- `GET /auth/profile` - Kullanıcı profili

### Müşteriler
- `GET /customers` - Müşteri listesi
- `POST /customers` - Yeni müşteri
- `GET /customers/:id` - Müşteri detayı
- `PATCH /customers/:id` - Müşteri güncelle
- `DELETE /customers/:id` - Müşteri sil

### Satış Fırsatları
- `GET /opportunities` - Fırsat listesi
- `POST /opportunities` - Yeni fırsat
- `PATCH /opportunities/:id/stage` - Aşama değiştir

### Görevler
- `GET /tasks` - Görev listesi
- `POST /tasks` - Yeni görev
- `PATCH /tasks/:id` - Görev güncelle
- `DELETE /tasks/:id` - Görev sil

### Faturalar
- `GET /invoices` - Fatura listesi
- `POST /invoices` - Yeni fatura
- `GET /invoices/:id/pdf` - PDF indir
- `PATCH /invoices/:id` - Fatura güncelle

## Swagger Dokümantasyonu

Backend çalıştıktan sonra:

```
http://localhost:3000/api
```

## Scripts

```bash
npm run start:dev    # Development mode
npm run build        # Production build
npm run start:prod   # Production mode
npm run test         # Test çalıştır
npm run seed         # Database seed
```

## Yapı

```
src/
├── modules/          # İş modülleri
│   ├── auth/        # Kimlik doğrulama
│   ├── customers/   # Müşteri yönetimi
│   ├── opportunities/ # Satış fırsatları
│   ├── tasks/       # Görev yönetimi
│   ├── invoices/    # Faturalama
│   └── ...
├── common/          # Ortak bileşenler
│   ├── guards/     # Auth guards
│   ├── decorators/  # Custom decorators
│   └── filters/    # Exception filters
└── config/         # Yapılandırma dosyaları
```

