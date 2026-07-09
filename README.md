# AI Photo Effect App

AI Photo Effect App, iOS üzerinden seçilen bir fotoğrafı yapay zeka destekli efektlere dönüştüren bir MVP projesidir. Proje üç ana parçadan oluşur:

- **iOS App:** Kullanıcı fotoğraf seçer, efekti seçer, sonucu görüntüler.
- **Backend API:** Fotoğrafı alır, seçilen efektin promptunu bulur, AI provider'a gönderir ve sonucu döner.
- **Admin Panel:** Efekt/prompt yönetimi için JWT ile korunan React/Vite yönetim panelidir.

## Mevcut Durum

Bu repo şu anda çalışan bir MVP omurgasına sahiptir:

- Backend Node.js + Express ile çalışır.
- Efektler ve generate geçmişi MySQL üzerinde kalıcı olarak saklanır.
- Fotoğraf yükleme için Multer kullanılır.
- AI provider soyutlanmıştır.
- Mock AI provider mevcuttur.
- Replicate AI provider entegre edilmiştir.
- Admin panel endpointleri JWT tabanlı authentication/authorization ile korunur.
- Generate ve login endpointlerinde rate limit uygulanır.
- iOS uygulaması SwiftUI + MVVM yapısı ile backend'e bağlanır.
- iOS tarafında fotoğraf seçme, efekt listeleme, generate isteği ve sonuç görüntüleme akışı çalışır.

## Klasör Yapısı

```txt
ai-photo-effect-app
├── backend
│   ├── src
│   │   ├── config
│   │   ├── database
│   │   ├── middlewares
│   │   ├── modules
│   │   │   ├── auth
│   │   │   ├── effects
│   │   │   └── generation
│   │   └── services
│   │       ├── ai
│   │       └── storage
│   ├── uploads
│   ├── .env.example
│   └── package.json
├── ios-app
│   └── ai-photo-effect-app
│       └── ai-photo-effect-app.xcodeproj
└── admin-panel
```

## Backend

Backend katmanlı mimari ile hazırlanmıştır:

```txt
Route -> Controller -> Service -> Repository
```

Bu yapı sayesinde endpoint, request/response, iş mantığı ve veri erişimi ayrı sorumluluklarda tutulur.

### Backend Özellikleri

- `GET /health`
- `GET /api/effects`
- `POST /api/generate`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/generations` (admin)
- `GET /api/admin/effects` (admin)
- `POST /api/admin/effects` (admin)
- `PUT /api/admin/effects/:id` (admin)
- `DELETE /api/admin/effects/:id` (admin)

### Authentication / Authorization

Admin panel JWT tabanlı authentication kullanır. `POST /api/auth/login` başarılı olursa token döner; admin panel bu token'ı `Authorization: Bearer <token>` header'ı ile sonraki isteklerde gönderir.

`/api/effects` ve `/api/generate` public kalır. `/api/admin/effects` ve `/api/generations` endpointleri `requireAuth` ve `requireAdmin` middleware'leri ile korunur.

Admin hesabı `npm run db:setup` sırasında `.env` içindeki `ADMIN_EMAIL` ve `ADMIN_PASSWORD` değerlerinden seed edilir.

### Rate Limit

Backend `express-rate-limit` kullanır:

- Genel API limiti: `RATE_LIMIT_MAX`
- Generate limiti: `GENERATE_RATE_LIMIT_MAX`
- Login limiti: `LOGIN_RATE_LIMIT_MAX`

Limit aşılırsa API standart formatta `429` döner:

```json
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

### HTTP Status Codes

API response formatı standarttır:

```json
{
  "success": true,
  "data": {}
}
```

Hata formatı:

```json
{
  "success": false,
  "message": "Effect not found."
}
```

Kullanılan ana status code'lar:

- `200`: listeleme, güncelleme, silme
- `201`: generate veya create işlemi
- `400`: validation hatası
- `401`: token yok veya geçersiz
- `403`: admin yetkisi yok veya effect pasif
- `404`: kayıt veya route bulunamadı
- `409`: duplicate effect id
- `429`: rate limit
- `502`: AI provider hatası
- `504`: AI provider timeout
- `500`: beklenmeyen sunucu hatası

### SOLID Principles in this project

Backend katmanlı yapı ile sorumlulukları ayırır:

- Route sadece URL ve middleware eşleştirir.
- Controller request/response formatını yönetir.
- Service iş kurallarını taşır.
- Repository MySQL erişimini soyutlar.
- AI provider soyutlaması mock ve Replicate provider'larını aynı servis üzerinden kullanmayı sağlar.

### Backend Kurulum

```bash
cd backend
npm install
```

Backend için `.env.example` dosyasını referans alarak `.env` oluştur:

```bash
cp .env.example .env
```

Geliştirme sunucusunu başlat:

```bash
npm run db:setup
npm run dev
```

Varsayılan backend adresi:

```txt
http://localhost:3001
```

## Environment Ayarları

Backend `.env` dosyasında iki AI modu desteklenir:

Temel güvenlik ve limit ayarları:

```env
JWT_SECRET=uzun-rastgele-secret
JWT_EXPIRES_IN=1d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=guclu-bir-sifre
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
GENERATE_RATE_LIMIT_MAX=5
LOGIN_RATE_LIMIT_MAX=5
```

### Mock Mod

Mock mod, gerçek AI servisine gitmeden sahte sonuç görseli döndürür.

```env
AI_PROVIDER=mock
```

### Replicate Mod

Replicate modu, fotoğrafı ve promptu gerçek AI modeline gönderir.

```env
AI_PROVIDER=replicate
REPLICATE_API_TOKEN=r8_xxx
REPLICATE_MODEL=black-forest-labs/flux-kontext-pro
REPLICATE_INPUT_IMAGE_FIELD=input_image
```

> Not: `.env` dosyası GitHub'a yüklenmez. Token ve gizli bilgiler sadece lokal makinede tutulmalıdır.

### MySQL Ayarları

Backend, efektleri ve generate geçmişini MySQL'de saklar. Lokal geliştirmede Homebrew MySQL socket üzerinden çalışıyorsa `DB_SOCKET_PATH` kullanılabilir.

TCP bağlantı örneği:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_SOCKET_PATH=
DB_USER=root
DB_PASSWORD=buraya_mysql_sifren
DB_NAME=ai_photo_effect_app
```

Socket bağlantı örneği:

```env
DB_SOCKET_PATH=/tmp/mysql.sock
DB_USER=root
DB_PASSWORD=buraya_mysql_sifren
DB_NAME=ai_photo_effect_app
```

Database, tablolar ve başlangıç efektleri için:

```bash
cd backend
npm run db:setup
```

Bu komut `effects`, `generations` ve `admins` tablolarını hazırlar; admin hesabını `.env` değerlerinden oluşturur veya günceller.

## iOS App

iOS uygulaması mevcut UIKit proje yapısının içine SwiftUI ile eklenmiştir. `SceneDelegate`, SwiftUI `HomeView` ekranını açar.

### iOS Mimari

```txt
View -> ViewModel -> Service -> Backend
```

Ana dosyalar:

- `Features/Home/HomeView.swift`
- `Features/Home/HomeViewModel.swift`
- `Features/ImagePicker/PhotoPickerView.swift`
- `Features/Effects/EffectSelectionView.swift`
- `Features/Generation/ProcessingView.swift`
- `Features/Result/ResultView.swift`
- `Core/Services/EffectAPIService.swift`
- `Core/Services/GenerationAPIService.swift`

### iOS Akışı

1. Kullanıcı fotoğraf seçer.
2. Uygulama backend'den efekt listesini çeker.
3. Kullanıcı efekt seçer.
4. Generate butonuna basar.
5. Fotoğraf ve `effectId`, backend'e multipart/form-data olarak gider.
6. Backend AI provider üzerinden sonucu üretir.
7. iOS uygulaması dönen `resultImageUrl` değerini ekranda gösterir.

### Simülatör ve Gerçek Cihaz

Simülatörde backend adresi şu şekilde çalışır:

```swift
http://localhost:3001
```

Gerçek iPhone'da test ederken `localhost`, telefonun kendisini ifade eder. Bu yüzden `APIConfiguration.swift` içinde backend adresi Mac'in yerel IP adresi ile değiştirilmelidir:

```swift
http://192.168.1.25:3001
```

## Admin Panel

`admin-panel` React + Vite ile hazırlanmıştır. Login ekranı, dashboard ve efekt yönetimi ekranı içerir. Axios client, JWT token'ı her admin isteğine otomatik ekler; backend `401` dönerse token temizlenir.

Admin panel kurulumu:

```bash
cd admin-panel
npm install
npm run dev
```

Admin panel özellikleri:

- Login
- Efekt listeleme
- Efekt ekleme
- Efekt düzenleme
- Efekt silme veya pasifleştirme
- Prompt yönetimi
- Dashboard metrikleri

## Sonraki Geliştirme Adımları

1. Generate geçmişi için admin panelde ayrı ekran eklenmesi.
2. Daha kaliteli efekt presetleri ve promptların eklenmesi.
3. Backend deployment: Render veya Railway.
4. Admin panel deployment: Vercel.

## Güvenlik Notları

- `backend/.env` GitHub'a yüklenmemelidir.
- Replicate token veya başka API anahtarları commit edilmemelidir.
- `JWT_SECRET` ve `ADMIN_PASSWORD` production ortamında güçlü ve tahmin edilemez olmalıdır.
- `node_modules` ve upload edilen görseller repo dışında tutulur.

## Komut Özeti

Backend:

```bash
cd backend
npm install
npm run db:setup
npm run dev
```

iOS:

```txt
ios-app/ai-photo-effect-app/ai-photo-effect-app.xcodeproj
```

Xcode ile açıp simülatör veya gerçek cihazda çalıştır.
