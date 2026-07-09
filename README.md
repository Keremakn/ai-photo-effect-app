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
- iOS tarafında login, fotoğraf seçme, efekt listeleme, generate, history, favoriler, galeriye kaydetme ve Before / After karşılaştırma akışı çalışır.
- Admin panelde kullanıcı yönetimi, log inceleme, role yönetimi, prompt versiyonları, kategori/tag yönetimi ve dashboard grafikleri vardır.

## Geliştirme Günlüğü

Bu proje ilk aşamada çalışan bir MVP olarak başladı. Sonrasında backend mimarisi, güvenlik, kullanıcı yönetimi, admin panel ve iOS deneyimi adım adım geliştirildi.

### 1. İlk MVP

İlk sürümde amaç uçtan uca çalışan temel akışı kurmaktı:

1. iOS uygulaması fotoğraf seçebiliyordu.
2. Backend seçilen `effectId` değerine göre prompt buluyordu.
3. Fotoğraf ve prompt AI provider'a gönderiliyordu.
4. Backend sonucu iOS uygulamasına `resultImageUrl` olarak dönüyordu.
5. iOS uygulaması üretilen görseli ekranda gösteriyordu.

Bu aşamada proje çalışıyordu, ancak backend daha çok tek akışa odaklıydı. Auth, authorization, rate limit, standart hata yönetimi, kullanıcı bazlı log ve admin panel güvenliği henüz tam oturmamıştı.

### 2. Backend Katmanlarının Netleştirilmesi

Backend, Express içinde daha okunabilir ve değiştirilebilir hale getirildi:

1. Route, controller, service ve repository sorumlulukları ayrıldı.
2. Controller katmanı request/response formatına odaklandı.
3. Service katmanı iş kurallarını taşımaya başladı.
4. Repository katmanı MySQL sorgularını soyutladı.
5. AI provider soyutlaması eklendi; mock ve Replicate provider aynı servis arayüzünden kullanılabilir hale geldi.

Bu düzenleme SOLID prensiplerinden özellikle Single Responsibility ve Dependency Inversion tarafını güçlendirdi.

### 3. Environment ve Config Düzeni

Kod içine yazılmaması gereken değerler `.env` dosyasına taşındı:

1. Port, database bağlantısı, JWT secret, AI provider ayarları ve rate limit değerleri env üzerinden okunur hale geldi.
2. `src/config/env.js` ile zorunlu env değişkenleri uygulama başında kontrol edildi.
3. `src/config/database.js` ile MySQL bağlantısı merkezi hale getirildi.
4. `.env.example` dosyası kurulum için referans olarak tutuldu.

Böylece local, test ve production ayarları kod değiştirmeden yönetilebilir hale geldi.

### 4. Standart Hata Yönetimi

Backend hata formatı tek tipe indirildi:

```json
{
  "success": false,
  "message": "Effect not found."
}
```

Bu aşamada:

1. `ApiError` sınıfı eklendi.
2. `asyncHandler` helper'ı ile controller içindeki tekrar eden `try/catch` yapısı azaltıldı.
3. Merkezi error middleware status code ve mesajı standart JSON olarak döndürmeye başladı.
4. `notFound` middleware ile olmayan route'lar için `404` response üretildi.

Frontend ve iOS tarafı artık hata tiplerine göre daha doğru davranabilir hale geldi.

### 5. Authentication ve Authorization

Başta admin işlemleri public kalmaya yakındı. Bu güvenlik açığını kapatmak için JWT tabanlı auth eklendi:

1. `users` tablosu oluşturuldu.
2. Şifreler database'e düz metin değil, `bcrypt` ile hashlenmiş `password_hash` olarak yazıldı.
3. `POST /api/auth/register` ile kullanıcı kaydı eklendi.
4. `POST /api/auth/login` ile JWT token üretildi.
5. `GET /api/auth/me` ile token sahibi kullanıcı bilgisi döndürüldü.
6. `requireAuth` middleware token kontrolünü yapar hale geldi.
7. `requireAdmin` middleware role kontrolü yapar hale geldi.
8. Admin endpointleri sadece `admin` rolündeki kullanıcılara açıldı.

Normal kullanıcılar sadece kendi üretim geçmişini görebilir. Admin kullanıcılar tüm kullanıcıları, tüm generation loglarını ve tüm efekt/prompt ayarlarını yönetebilir.

### 6. Kullanıcı Rolleri ve Role Geçmişi

Admin panelden kullanıcıların yetkileri yönetilebilir hale getirildi:

1. Kullanıcılar `user` veya `admin` rolüne sahip olabilir.
2. Admin kullanıcı başka bir kullanıcıya admin yetkisi verebilir veya bu yetkiyi geri alabilir.
3. Role değişiklikleri `user_role_history` tablosuna yazılır.
4. Kullanıcı detay ekranında role geçmişi görüntülenebilir.

Bu sayede sadece mevcut rol değil, rol değişiminin ne zaman ve kim tarafından yapıldığı da takip edilebilir.

### 7. Rate Limit

Abuse ve maliyet kontrolü için rate limit eklendi:

1. Genel API limiti tanımlandı.
2. `/api/generate` için daha sıkı limit eklendi.
3. `/api/auth/login` için brute-force denemelerini azaltan login limiter eklendi.
4. Limit değerleri `.env` üzerinden yönetilebilir hale getirildi.
5. Limit aşımında standart `429` JSON response dönülür.

Generate endpointi AI provider maliyeti oluşturduğu için bu koruma özellikle önemlidir.

### 8. HTTP Status Code Düzeni

Endpoint response'ları HTTP kurallarına daha uygun hale getirildi:

1. Başarılı listeleme ve güncelleme işlemleri `200` döner.
2. Oluşturma işlemleri `201` döner.
3. Eksik veya hatalı input `400` döner.
4. Token yoksa veya geçersizse `401` döner.
5. Kullanıcının yetkisi yoksa `403` döner.
6. Kayıt bulunamazsa `404` döner.
7. Duplicate effect id için `409` döner.
8. Rate limit aşılırsa `429` döner.
9. AI provider hatalarında `502`, timeout durumunda `504` döner.

Bu yapı iOS ve web client'larının backend cevabına göre doğru aksiyon almasını kolaylaştırır.

### 9. Admin Panel Login ve API Client

Admin panel React/Vite tarafında güvenli hale getirildi:

1. Login ekranı eklendi.
2. Login sonrası JWT token `localStorage` içine yazıldı.
3. Axios client merkezi hale getirildi.
4. Axios interceptor her isteğe `Authorization: Bearer <token>` header'ı ekler hale geldi.
5. `401` response geldiğinde token temizlenip kullanıcı login ekranına yönlendirildi.
6. Token yoksa admin ekranlarına erişim engellendi.

Bu düzenleme sadece frontend koruması değildir; backend de admin endpointlerinde token ve role kontrolü yapar.

### 10. Normal Kullanıcı Web Deneyimi

Web panel sadece adminlere ait olmaktan çıkarıldı:

1. Normal kullanıcılar da web arayüzüne login olabilir.
2. Admin olmayan kullanıcılar sadece kendi generation geçmişini görür.
3. Admin kullanıcılar ise dashboard, users, logs ve effects ekranlarına erişebilir.
4. Kullanıcının rolüne göre menü ve erişilebilir ekranlar değişir.

Böylece aynı web uygulaması hem kullanıcı paneli hem admin paneli olarak kullanılabilir hale geldi.

### 11. Generation Logları ve Pagination

Log sistemi daha ölçeklenebilir hale getirildi:

1. Generation kayıtları database'de kullanıcıyla ilişkilendirildi.
2. Admin tüm kullanıcıların loglarını görebilir.
3. Normal kullanıcı sadece kendi loglarını görebilir.
4. Log endpointlerine pagination eklendi.
5. Admin panelde önceki/sonraki sayfa kontrolleri eklendi.
6. MySQL `LIMIT/OFFSET` uyumluluğu için limit ve offset değerleri backend'de güvenli şekilde normalize edildi.

Bu sayede log sayısı arttığında tek istekte tüm datayı yüklemek yerine sayfa sayfa veri çekilir.

### 12. Admin Panel Tablo Deneyimi

Admin panelde kullanıcı ve log tabloları geliştirildi:

1. Tablo başlıklarına tıklayarak sıralama yapılabilir.
2. Kullanıcı ve log tablolarında arama yapılabilir.
3. Sol menü sabit hale getirildi.
4. Hesap bilgisi ve logout butonu sol altta sabit konumlandırıldı.
5. Kullanıcı detay paneli eklendi.
6. Detay panelinde profil, kullanıcının üretimleri ve role geçmişi gösterilir.

Bu düzenlemeler admin paneli sadece teknik bir liste olmaktan çıkarıp daha kullanılabilir bir yönetim aracına dönüştürdü.

### 13. Favoriler Sistemi

Kullanıcıların tekrar erişmek isteyeceği içerikler için iki ayrı favori sistemi eklendi:

1. Kullanıcı efektleri favorileyebilir.
2. Favori efektler `favorite_effects` tablosunda tutulur.
3. Kullanıcı ürettiği sonuçları favorileyebilir.
4. Favori generation sonuçları `favorite_generations` tablosunda tutulur.
5. iOS tarafında efekt kartlarından favori seçilebilir.
6. iOS history ekranında üretim sonuçları favorilenebilir.
7. Web tarafında kullanıcı kendi favori generation kayıtlarını filtreleyebilir.

Bu yapı ileride kişiselleştirme ve öneri sistemi için de temel oluşturur.

### 14. Efekt Kategori ve Tag Sistemi

Efektlerin daha kolay yönetilmesi ve aranması için metadata eklendi:

1. `effects` tablosuna `category` alanı eklendi.
2. `effects` tablosuna `tags` alanı eklendi.
3. Seed efektlere kategori ve tag bilgileri yazıldı.
4. Admin panel effect formunda kategori ve tag alanları eklendi.
5. Effect tablosunda kategori ve tag bilgileri gösterildi.
6. Arama, effect adıyla birlikte kategori ve tag değerlerini de kapsar hale geldi.

Bu yapı ileride mobil tarafta kategori sekmeleri veya tag bazlı keşif ekranı için kullanılabilir.

### 15. Prompt Versiyonlama

Admin prompt değiştirdiğinde eski üretimlerin hangi promptla üretildiğini kaybetmemek için versiyonlama eklendi:

1. `effect_prompt_versions` tablosu oluşturuldu.
2. Yeni effect oluşturulurken ilk prompt versiyonu kaydedilir.
3. Effect promptu değiştirildiğinde yeni prompt versiyonu oluşturulur.
4. Generation oluşturulurken o an kullanılan `prompt_text` ve `prompt_version_id` generation kaydına yazılır.
5. Admin panelde effect düzenlerken prompt versiyon geçmişi görüntülenebilir.

Bu sayede prompt daha sonra değişse bile geçmiş generation kayıtlarının hangi prompt snapshot'ı ile üretildiği bilinir.

### 16. Admin Dashboard Grafikleri

Admin ana ekranı sadece sayı göstermek yerine daha anlamlı özetler sunar hale getirildi:

1. Günlük generation sayısı grafiği eklendi.
2. Son 30 gündeki aktif kullanıcı sayısı gösterildi.
3. En çok kullanılan efektler grafiği eklendi.
4. Toplam kullanıcı, toplam efekt ve generation metrikleri dashboard üzerinde toplandı.

Bu ekran ürünün kullanımını hızlıca anlamak için temel analitik paneli gibi çalışır.

### 17. iOS Login ve Kullanıcı Bazlı History

iOS uygulaması kullanıcı hesabı ile çalışır hale getirildi:

1. Login ve register ekranı eklendi.
2. Token session store içinde saklandı.
3. Generate isteğine token eklendi.
4. Backend generation kaydını token sahibi kullanıcıya bağlar hale geldi.
5. iOS history ekranı `GET /api/generations/me` endpointinden kullanıcının kendi üretimlerini çeker.
6. Logout olunca local session, history ve favori state temizlenir.

Bu sayede mobil taraftaki üretimler de doğru kullanıcıya bağlanır.

### 18. iOS Sonuç Kaydetme

Üretilen görseli cihaz galerisine indirmek için Photos entegrasyonu eklendi:

1. `PhotoLibrarySaveService` oluşturuldu.
2. Sonuç ekranına kaydetme butonu eklendi.
3. Uygulama Photos permission durumunu kontrol eder.
4. Görsel URL'den indirilip kullanıcının galerisine kaydedilir.
5. Başarılı durumda kullanıcıya bildirim mesajı gösterilir.

Bu özellik uygulamayı demo olmaktan çıkarıp gerçek kullanıcı akışına yaklaştırır.

### 19. iOS Before / After Karşılaştırma

Generate sonrası kullanıcı orijinal fotoğraf ile üretilen sonucu kıyaslayabilir hale getirildi:

1. Result ekranına Before / After karşılaştırma görünümü eklendi.
2. Slider ile orijinal ve üretilmiş görsel arasında geçiş yapılabilir.
3. Generate sonrası karşılaştırma alanı sayfanın altında değil, seçilen fotoğraf alanının yerine yerleştirildi.
4. Kullanıcı isterse `Change Photo` butonu ile yeni fotoğraf seçebilir.

Bu ekran özellikle fotoğraf efekt uygulaması için sonucu daha anlaşılır ve etkileyici hale getirir.

### 20. Bug Fix ve Stabilizasyon

Son aşamada test sırasında görülen hatalar düzeltildi:

1. Admin panel loglar sayfasındaki `Something went wrong` hatası çözüldü.
2. Kullanıcı detay sayfasındaki generation yükleme hatası çözüldü.
3. iOS açılışta ve history sekmesinde görülen history kaynaklı hata çözüldü.
4. Backend generation pagination query'si MySQL uyumlu hale getirildi.
5. Admin panel build ve backend test/import kontrolleri tekrar çalıştırıldı.

Bu aşamadan sonra admin logları, kullanıcı detay üretimleri ve iOS history endpointleri `200` response dönecek şekilde doğrulandı.

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
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/generations/me` (login user)
- `GET /api/admin/generations` (admin)
- `GET /api/admin/users` (admin)
- `GET /api/admin/effects` (admin)
- `POST /api/admin/effects` (admin)
- `PUT /api/admin/effects/:id` (admin)
- `DELETE /api/admin/effects/:id` (admin)

### Authentication / Authorization

Auth sistemi `users` tablosu ve `role` alanı üzerinden çalışır. Şifreler database'e düz metin olarak yazılmaz; `bcrypt` ile hashlenmiş `password_hash` değeri tutulur.

`POST /api/auth/login` başarılı olursa JWT token döner. Client bu token'ı `Authorization: Bearer <token>` header'ı ile sonraki isteklerde gönderir.

Normal kullanıcılar `user` rolüyle kendi üretim geçmişlerini `GET /api/generations/me` üzerinden görebilir. Admin rolündeki kullanıcılar `/api/admin/effects`, `/api/admin/generations` ve `/api/admin/users` endpointleriyle tüm veriye erişebilir.

`/api/effects` public kalır. `/api/generate` geriye uyumluluk için token olmadan da çalışır; token gönderilirse generation kaydı ilgili kullanıcıya bağlanır.

İlk admin hesabı `npm run db:setup` sırasında `.env` içindeki `ADMIN_EMAIL` ve `ADMIN_PASSWORD` değerlerinden seed edilir. Bu değerler sadece bootstrap içindir; login runtime'da database'deki `users` kaydından çalışır.

Admin kullanıcı rolleri `user/admin` arasında değiştirebilir. Role değişiklikleri `user_role_history` tablosunda saklanır.

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

### Favoriler ve Prompt Versiyonlama

Kullanıcılar efektleri ve ürettikleri sonuçları favoriye alabilir. Favori efektler `favorite_effects`, favori sonuçlar `favorite_generations` tablosunda tutulur.

Efektlerde `category` ve `tags` alanları vardır. Admin panelden düzenlenebilir; mobil ve web arayüzlerinde filtreleme/arama için kullanılır.

Prompt değişiklikleri `effect_prompt_versions` tablosuna kaydedilir. Generation kaydı oluşturulurken kullanılan prompt snapshot'ı ve prompt version id generation üzerinde saklanır.

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

Bu komut `effects`, `generations`, `users` ve eski kurulumlarla uyumluluk için `admins` tablolarını hazırlar; bootstrap admin hesabını `.env` değerlerinden `users` tablosuna oluşturur veya günceller.

## iOS App

iOS uygulaması mevcut UIKit proje yapısının içine SwiftUI ile eklenmiştir. `SceneDelegate`, SwiftUI `HomeView` ekranını açar.

### iOS Mimari

```txt
View -> ViewModel -> Service -> Backend
```

Ana dosyalar:

- `Features/Auth/AuthView.swift`
- `Features/Home/HomeView.swift`
- `Features/Home/HomeViewModel.swift`
- `Features/ImagePicker/PhotoPickerView.swift`
- `Features/Effects/EffectSelectionView.swift`
- `Features/Generation/ProcessingView.swift`
- `Features/Result/ResultView.swift`
- `Core/Services/AuthAPIService.swift`
- `Core/Services/AuthSessionStore.swift`
- `Core/Services/EffectAPIService.swift`
- `Core/Services/GenerationAPIService.swift`
- `Core/Services/PhotoLibrarySaveService.swift`

### iOS Akışı

1. Kullanıcı login olur veya hesap oluşturur.
2. Uygulama backend'den efekt listesini çeker.
3. Kullanıcı fotoğraf seçer.
4. Kullanıcı efekt seçer.
5. Generate butonuna basar.
6. Fotoğraf, `effectId` ve JWT token backend'e gider.
7. Backend generation kaydını kullanıcıya bağlar.
8. iOS uygulaması dönen `resultImageUrl` değerini ekranda gösterir.
9. Kullanıcı sonucu Photos galerisine kaydedebilir.
10. Kullanıcı efektleri ve üretim sonuçlarını favorileyebilir.
11. Kullanıcı Before / After karşılaştırma ekranında orijinal ve üretilen görseli kıyaslayabilir.

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
- Kullanıcı listeleme
- Tüm generation loglarını görüntüleme
- Kullanıcı ve log tablolarında arama
- Tablo başlıklarına tıklayarak sıralama
- Generation loglarında pagination
- Kullanıcı detay paneli: profil, üretimler, role geçmişi
- Admin dashboard grafikleri: günlük üretim ve popüler efektler
- Efekt kategori/tag yönetimi
- Prompt versiyon geçmişi
- Sabit sol menü ve sabit hesap/çıkış alanı
- Efekt listeleme
- Efekt ekleme
- Efekt düzenleme
- Efekt silme veya pasifleştirme
- Prompt yönetimi
- Dashboard metrikleri

## Sonraki Geliştirme Adımları

1. Auth token saklamayı UserDefaults yerine Keychain'e taşıma.
2. Kullanıcı bazlı quota/abonelik sistemi ekleme.
3. Daha kaliteli efekt presetleri ve promptların eklenmesi.
4. Backend deployment: Render veya Railway.
5. Admin panel deployment: Vercel.

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
