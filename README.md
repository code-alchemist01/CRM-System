# CRM System

Modern ve ölçeklenebilir bir CRM (Customer Relationship Management) sistemi. Multi-tenant mimarisi ile birden fazla organizasyonun aynı sistem üzerinde çalışmasını sağlar.

## 🚀 Özellikler

### Müşteri Yönetimi
- Müşteri kayıtları ve detaylı bilgiler
- İletişim kişileri yönetimi
- Müşteri geçmişi ve notlar
- Bağlı kayıt kontrolü ile güvenli silme

### Satış Fırsatları
- Kanban board görünümü ile pipeline yönetimi
- Drag & drop ile aşama değiştirme
- Aşama bazlı takip
- Değer ve kapanış tarihi takibi

### Görev Yönetimi
- Görev oluşturma ve atama
- Durum takibi (Beklemede, Devam Ediyor, Tamamlandı, İptal)
- Öncelik seviyeleri (Düşük, Orta, Yüksek, Acil)
- Bitiş tarihi ve hatırlatıcılar

### Aktivite Yönetimi
- Aktivite oluşturma ve takibi
- Aktivite tipleri (Arama, E-posta, Toplantı, Not, Görev)
- Müşteri ve fırsat ile ilişkilendirme
- Tarih bazlı filtreleme

### Doküman Yönetimi
- Dosya yükleme ve indirme
- Dosya önizleme (resimler için)
- Kategori bazlı organizasyon
- Müşteri ve fırsat ile ilişkilendirme

### E-posta Yönetimi
- E-posta oluşturma ve gönderme
- SMTP entegrasyonu
- Taslak kaydetme
- Müşteri ve fırsat ile ilişkilendirme
- Çoklu alıcı desteği (CC, BCC)

### Faturalama
- Fatura oluşturma ve yönetimi
- PDF export desteği (UTF-8 karakter desteği)
- Durum takibi (Taslak, Gönderildi, Ödendi, İptal)
- Fatura kalemleri ve KDV hesaplama

### Raporlama
- Satış raporları (gelir, fırsatlar, dönüşüm oranı)
- Görev raporları (tamamlanma oranı, durum dağılımı)
- Fatura raporları (gelir, durum dağılımı)
- Grafikler ve görselleştirmeler
- Tarih aralığı filtreleme

### Dashboard
- Genel istatistikler
- Grafikler ve görselleştirmeler
- Son aktiviteler
- Müşteri, fırsat, görev ve fatura özetleri

### Bildirimler
- Gerçek zamanlı bildirimler (WebSocket)
- Bildirim zili ve badge
- Okundu/okunmadı durumu
- Bildirim geçmişi

### Denetim Kayıtları
- Otomatik değişiklik kayıtları
- Kullanıcı aktivite takibi
- Veri değişiklik geçmişi
- Filtreleme ve arama

### Profil Yönetimi
- Profil bilgileri güncelleme
- Şifre değiştirme
- Kullanıcı bilgileri düzenleme

### Güvenlik
- JWT tabanlı kimlik doğrulama
- Refresh token desteği
- Rol tabanlı erişim kontrolü (RBAC)
- Multi-tenant veri izolasyonu
- Otomatik audit logging

## 🛠️ Teknolojiler

### Backend
- **NestJS** - Node.js framework
- **PostgreSQL** - Veritabanı
- **TypeORM** - ORM
- **Redis** - Cache
- **JWT** - Authentication
- **Socket.io** - WebSocket
- **PDFKit** - PDF oluşturma

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Ant Design** - UI component library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Vite** - Build tool

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (opsiyonel)
- npm veya yarn

## 🏃 Hızlı Başlangıç

### 1. Repository'yi klonlayın

```bash
git clone https://github.com/code-alchemist01/CRM-System.git
cd CRM-System
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
cp env.example .env
# .env dosyasını düzenleyin
npm run start:dev
```

Detaylı kurulum için [backend/README.md](backend/README.md) dosyasına bakın.

### 3. Frontend Kurulumu

```bash
cd frontend
npm install
cp env.example .env
# .env dosyasını düzenleyin
npm run dev
```

Detaylı kurulum için [frontend/README.md](frontend/README.md) dosyasına bakın.

### 4. Veritabanı Kurulumu

```bash
cd backend
npm run seed
```

Bu komut veritabanı migration'larını çalıştırır ve ilk admin kullanıcısını oluşturur.

## 🔐 Varsayılan Giriş Bilgileri

İlk kurulumdan sonra:

- **Email**: admin@example.com
- **Şifre**: admin123

**Önemli**: İlk girişten sonra şifrenizi değiştirin!

### Admin Bilgilerini Değiştirme

Admin bilgilerini değiştirmek için iki yöntem var:

#### 1. Profil Sayfasından (Önerilen)

1. Sisteme giriş yapın
2. Sağ üst köşedeki kullanıcı menüsünden "Profil" seçeneğine tıklayın
3. Profil bilgilerini güncelleyin (Ad, Soyad)
4. Şifre değiştirmek için "Şifre Değiştir" bölümünü kullanın

**Not**: E-posta adresi profil sayfasından değiştirilemez. E-posta değiştirmek için backend seed dosyasını kullanın.

#### 2. Backend Seed Dosyasından

`backend/src/database/seeds/initial-seed.ts` dosyasını açın ve `adminUser` kısmını bulun (yaklaşık satır 100-113):

```typescript
let adminUser = await userRepository.findOne({ where: { email: 'admin@example.com' } });
if (!adminUser) {
  const hashedPassword = await bcrypt.hash('admin123', 10); // Şifreyi buradan değiştirin
  adminUser = userRepository.create({
    email: 'admin@example.com', // Email'i buradan değiştirin
    password: hashedPassword,
    firstName: 'Admin', // İsmi buradan değiştirin
    lastName: 'User', // Soyismi buradan değiştirin
    // ...
  });
}
```

Değişikliklerden sonra:

1. Veritabanındaki mevcut admin kullanıcısını silin (opsiyonel)
2. Seed komutunu tekrar çalıştırın:
   ```bash
   cd backend
   npm run seed
   ```

**Not**: Eğer admin kullanıcısı zaten varsa, seed dosyası yeni kullanıcı oluşturmaz. Mevcut kullanıcıyı silmek için veritabanından manuel olarak silebilirsiniz.

## 📁 Proje Yapısı

```
CRM-System/
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── modules/  # İş modülleri
│   │   ├── common/   # Ortak bileşenler
│   │   └── config/   # Yapılandırma
│   └── assets/       # Statik dosyalar (fontlar vb.)
│
└── frontend/         # React frontend
    ├── src/
    │   ├── features/ # Sayfa bileşenleri
    │   ├── components/ # Yeniden kullanılabilir bileşenler
    │   ├── store/    # Redux store
    │   └── locales/  # Çeviri dosyaları
    └── public/
```

## 🌐 API Dokümantasyonu

Backend çalıştıktan sonra Swagger dokümantasyonuna şu adresten erişebilirsiniz:

```
http://localhost:3000/api
```

## 🔧 Geliştirme

### Backend

```bash
cd backend
npm run start:dev    # Development mode
npm run build        # Production build
npm run test         # Test çalıştır
```

### Frontend

```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Production preview
```

## 📝 Notlar

- PDF export özelliği için DejaVu Sans font dosyası gereklidir. Font dosyası `backend/assets/fonts/DejaVuSans.ttf` konumunda olmalıdır. Otomatik indirme için `backend/scripts/download-font.ps1` scriptini çalıştırabilirsiniz.
- Multi-tenant yapı sayesinde her organizasyon kendi verilerine erişir.
- Redis cache kullanımı opsiyoneldir ancak performans için önerilir.
- E-posta göndermek için SMTP ayarlarını yapılandırmanız gerekir. Detaylı bilgi için backend `.env` dosyasındaki SMTP ayarlarına bakın.
- Tüm CRUD işlemleri otomatik olarak audit log'a kaydedilir.
- Sistem çoklu dil desteği sunar (Türkçe/İngilizce).

## 📄 Lisans

Bu proje özel bir projedir.

## 👥 Katkıda Bulunanlar

- Proje geliştiricileri

## 📞 İletişim

Sorularınız için issue açabilirsiniz.

