# Satınalma Talep Yönetim Sistemi - Geliştirici Dokümantasyonu

## 1. Projenin Amacı ve Genel Bakış

Bu proje, SAP sistemiyle entegre çalışacak web tabanlı bir satınalma talebi yönetim sistemi oluşturmayı amaçlamaktadır. Kullanıcıların kolayca satınalma talepleri oluşturmasına, bu talepleri takip etmesine ve ilgili onay süreçlerini yönetmesine olanak tanır.

- **Teknoloji Stack:** React (Vite), TypeScript, TailwindCSS, Shadcn/UI.
- **Veri Yönetimi:** Tüm veriler (kullanıcı bilgileri, talepler vb.) prototip aşamasında tarayıcının `localStorage`'ı üzerinden yönetilmektedir.
- **Ana Modüller:**
    - Kullanıcı Girişi (`Login.tsx`)
    - Talep Açma Formu (`task-form.tsx` -> `Home.tsx`)
    - Talep Listesi (`TalepListesi.tsx`)

---

## 2. Sayfa Yapıları ve Fonksiyonları

### 2.1. Satınalma Talep Formu (`src/components/task-form.tsx`)

Bu bileşen, yeni satınalma talepleri oluşturmak veya mevcut talepleri düzenlemek için kullanılır.

**Sayfanın Amacı:** Kullanıcının gerekli tüm bilgileri girerek bir satınalma talebi oluşturmasını sağlamak.

**Fonksiyonlar:**
- Yeni talep oluşturma.
- "Revize İstendi" durumundaki bir talebi düzenleme.
- Form alanlarını dinamik olarak yönetme (tarih etkileşimleri, satır ekleme/silme).
- Alan bazında zorunluluk kontrolü (validasyon).
- Kalem ve Satıcı seçimi için popup (dialog) pencereleri.

**Başlık Alanları (Header):**

| Web Alanı Adı | SAP Alanı | Zorunlu | Salt Okunur | Kod Mantığı ve Notlar |
| :--- | :--- | :---: | :---: | :--- |
| **Doküman No** | `OPRQ.DocNum` | Evet | Evet | `localStorage`'daki mevcut taleplerin en yüksek `documentNumber` değerinden bir fazlası olarak otomatik atanır. |
| **Talep Eden** | `OPRQ.Reqname` | Evet | Evet | Sisteme giriş yapan kullanıcının adı (`currentUser.name`) ile `localStorage`'dan otomatik dolar. |
| **Belge Tarihi** | `OPRQ.TaxDate` | Evet | Hayır | `SAPDateInput` bileşeni kullanılır. Varsayılan olarak günün tarihini alır, kullanıcı değiştirebilir. |
| **Gerekli Tarih**| `OPRQ.Reqdate` | Evet | Hayır | `SAPDateInput` bileşeni kullanılır. Talebin geneli için kullanılır. **Önemli:** Bu alan değiştiğinde, dolu satırlar varsa, satır tarihlerini güncellemek için bir onay penceresi (`window.confirm`) gösterilir. |
| **Geçerlilik T.**| `OPRQ.DocDueDate`| Evet | Hayır | `SAPDateInput` bileşeni kullanılır. Kullanıcı tarafından manuel girilir. |
| **Talep Özeti** | `OPRQ.U_TalepOzeti`| Evet | Hayır | Standart `Input` bileşeni. |
| **Acil Talep** | `OPRQ.U_AcilMi` | Hayır | Hayır | `isUrgent` state'i ile yönetilen bir `button` toggle. `true`/`false` değeri alır. |
| **Açıklamalar** | `OPRQ.Comments` | Hayır | Hayır | `Textarea` bileşeni ile girilen genel notlar. |

**Satır Alanları (Lines):**

| Web Alanı Adı | SAP Alanı | Zorunlu | Salt Okunur | Kod Mantığı ve Notlar |
| :--- | :--- | :---: | :---: | :--- |
| **Kalem Kodu** | `OITM.ItemCode` | Evet | Hayır | `ItemSelectionDialog` popup'ı üzerinden seçilebilir veya manuel girilebilir. |
| **Kalem Tanımı**| `OITM.ItemName` | Evet | Evet | Kalem Kodu seçildiğinde `ItemSelectionDialog` tarafından otomatik doldurulur. |
| **Gerekli Tarih**| `PRQ1.PQTRegdate`| Evet | Hayır | `SAPDateInput` kullanılır. Yeni satır eklendiğinde başlık "Gerekli Tarih" alanından değerini alır. |
| **Miktar** | `PRQ1.Quantity` | Evet | Hayır | `Input type="number"`. Miktar girilir. |
| **Ölçü Birimi**| `PRQ1.UomCode` | Evet | Hayır | `select` dropdown ile listeden seçilir (AD, KG, LT vb.). |
| **Satıcı Kodu** | `PRQ1.VendorCode`| Hayır | Evet | `VendorSelectionDialog` popup'ı ile seçilir. Alan salt okunurdur, sadece popup ile değiştirilir. |
| **Departman** | `PRQ1.OcrCode` | Evet | Hayır | `select` dropdown ile listeden seçilir (Konsol, Bakır vb.). |
| **Satır Açıklama**| `PRQ1.FreeTxt` | Hayır | Hayır | Satıra özel açıklama için `Input` alanı. |
| **Ek Dosya** | `ATC1` Tablosu | Hayır | Hayır | `input type="file"` ile dosya yükleme. |

### 2.2. Talep Listesi (`src/pages/TalepListesi.tsx`)

Oluşturulan tüm satınalma taleplerinin görüntülendiği, filtrelendiği ve yönetildiği ana ekrandır.

**Sayfanın Amacı:** Kullanıcılara rollerine göre ilgili talepleri göstermek, durumlarını takip etme ve talepler üzerinde işlem yapma (detay görme, red, revize vb.) imkanı sunmak.

**Fonksiyonlar:**
- Talepleri listeleme ve sayfalama.
- Tüm kolonlar üzerinden kapsamlı filtreleme ve arama.
- Talep detaylarını bir popup (`Dialog`) içinde görüntüleme.
- **Satınalmacı/Admin için:** Talebi reddetme veya revize isteme.
- **Talep Sahibi için:** Revizeye gönderilmiş talebi düzenlemeye yönlendirme.
- Liste verilerini Excel'e aktarma (`xlsx` kütüphanesi kullanılır).
- Test verisi oluşturma.

**Liste Kolonları:**

| Web Alanı Adı | SAP Alanı | Kod Mantığı ve Notlar |
| :--- | :--- | :--- |
| **Doküman No** | `OPRQ.DocNum` | `request.documentNumber` |
| **Talep Özeti** | `OPRQ.U_TalepOzeti` | `request.requestSummary` |
| **Talep Eden** | `OPRQ.Reqname` | `request.requester` |
| **Departman** | `PRQ1.OcrCode` | `request.department`. Talebin genel departmanı. |
| **Belge Tarihi** | `OPRQ.TaxDate` | `request.documentDate` |
| **Gerekli Tarih** | `OPRQ.Reqdate` | `request.requiredDate` |
| **Geçerlilik T.**| `OPRQ.DocDueDate`| `request.validityDate` |
| **Kayıt Tarihi** | `OPRQ.DocDate` | `request.createdDate` |
| **Acil Talep** | `OPRQ.U_AcilMi` | `request.isUrgent` boolean değerine göre `⚠️` ikonu gösterilir. |
| **Talep Durumu** | `OPRQ.U_TalepDurum` | `request.status`. Duruma göre renkli etiketler (`statusColors`) gösterilir. |
| **Revize/Red Nedeni**| `OPRQ.U_RevizeNedeni`, `OPRQ.U_RedNedeni`| Bu alanlar direkt bir kolonda gösterilmez, talebin `notes` alanına eklenir ve detay popup'ında görüntülenir. |

---

## 3. Yetkilendirme ve Roller

Yetkilendirme, `localStorage`'da saklanan `currentUser` nesnesinin `role` özelliğine göre yapılır.

| Rol | Açıklama | Sayfa Yetkileri |
| :--- | :--- | :--- |
| **user** (Talep Açan) | Standart kullanıcı. Sadece kendi taleplerini oluşturabilir ve görüntüleyebilir. | - Talep açabilir.<br>- Sadece kendi taleplerini `Talep Listesi`'nde görür.<br>- Durumu "Revize İstendi" olan kendi talebini düzenleyebilir. |
| **purchaser** (Satınalmacı) | Onay ve işlem yetkisine sahip kullanıcı. | - Talep açabilir.<br>- Tüm kullanıcıların taleplerini görür.<br>- Talepleri "Reddedildi" veya "Revize İstendi" olarak güncelleyebilir. |
| **admin** (Yönetici) | Tüm yetkilere sahip kullanıcı. | - `purchaser` ile aynı yetkilere sahiptir. |

**Kod Mantığı:**
- `task-form.tsx` ve `TalepListesi.tsx` bileşenlerinde `useEffect` içinde `localStorage`'dan kullanıcı bilgisi okunur.
- Eğer kullanıcı yoksa `/login` sayfasına yönlendirilir.
- `TalepListesi.tsx` içinde `role === 'user'` ise liste, `req.requester === currentUser.name` koşuluna göre filtrelenir.
- Red/Revize butonları, `currentUser.role`'ün `purchaser` veya `admin` olmasına göre render edilir.

---

## 4. Talep Açma Süreci ve Kuralları

### 4.1. Zorunlu Alanlar (`validateForm` fonksiyonu)
Formun kaydedilebilmesi için aşağıdaki alanların dolu olması gerekir:
- **Başlık:** Belge Tarihi, Gerekli Tarih, Geçerlilik Tarihi, Talep Özeti.
- **Her Satır İçin:** Kalem Kodu, Kalem Tanımı, Gerekli Tarih, Miktar, Ölçü Birimi Kodu, Departman.

### 4.2. Tarih Alanlarının Etkileşimi
- **Senaryo 1: Başlık "Gerekli Tarih" alanını değiştirmek.**
  - **Durum:** Satır listesinde en az bir satırın "Gerekli Tarih" alanı dolu.
  - **Etki:** Kullanıcıya "Mevcut tablo satırlarını gerekli yeni tarih ile güncellemek istiyor musunuz?" şeklinde bir onay (`window.confirm`) mesajı gösterilir.
    - **Evet:** Tüm satırların `requiredDate` alanı, başlıkta girilen yeni tarih ile güncellenir.
    - **Hayır:** Satırlar değişmez. Sadece bu değişiklikten sonra eklenecek yeni satırlar yeni tarihi alır.
  - **Durum:** Hiçbir satırın "Gerekli Tarih" alanı dolu değil.
  - **Etki:** Tüm satırların `requiredDate` alanı otomatik olarak yeni tarih ile güncellenir.

- **Senaryo 2: Yeni satır eklemek.**
  - **Etki:** Yeni eklenen satırın "Gerekli Tarih" alanı, başlıkta o an seçili olan "Gerekli Tarih" değeriyle otomatik olarak doldurulur.

### 4.3. Diğer Kurallar
- En az bir talep satırı bulunmalıdır. Son satır silinemez (`handleDeleteRow`).
- Kalem Tanımı alanı, Kalem Kodu seçildiğinde otomatik dolduğu için salt okunurdur.

---

## 5. Talep Listesi ve İşlemler

- **Detay Görüntüleme:** Listeden bir satıra tıklandığında, talebin tüm başlık ve satır bilgilerini içeren bir popup açılır.
- **Revize Süreci:**
  1. Satınalmacı, bir talebi "Revize İste" butonu ile ve bir neden belirterek revizeye gönderir.
  2. Talebin durumu "Revize İstendi" olarak güncellenir.
  3. Talep sahibi, listesindeki bu talebi görür ve detayını açtığında "Düzenle ve Tekrar Gönder" butonunu görür.
  4. Butona tıkladığında talep formu, bu talebin bilgileriyle dolu şekilde açılır.
  5. Talep sahibi gerekli düzenlemeleri yapıp kaydettiğinde, talep tekrar iş akışına döner.
- **Reddetme Süreci:**
  1. Satınalmacı, bir talebi "Reddet" butonu ile ve bir neden belirterek reddeder.
  2. Talebin durumu "Reddedildi" olarak güncellenir ve işlem tamamlanır.

---

## 6. Teknik Notlar ve İş Mantığı

- **State Yönetimi:** Tüm form ve liste durumları, React'in `useState`, `useEffect` ve `useMemo` hook'ları ile yönetilmektedir.
- **Component Mimarisi:** Ana sayfalar (`Home`, `TalepListesi`) `src/pages` altında, yeniden kullanılabilir bileşenler (`task-form`, `Sidebar`, `ItemSelectionDialog` vb.) `src/components` altında yer alır.
- **Veri Kalıcılığı:** Uygulama kapatılıp açıldığında verilerin kaybolmaması için tüm talepler ve kullanıcı bilgisi `localStorage`'da saklanır. SAP entegrasyonu yapıldığında bu kısım API çağrıları ile değiştirilecektir.
- **Tarih Formatlama:** Tarihlerin `DD/MM/YYYY` formatında gösterilmesi için `formatDate` ve `SAPDateInput` gibi yardımcı fonksiyonlar ve bileşenler kullanılır.
- **Excel Aktarımı:** `xlsx` kütüphanesi, `filteredRequests` verisini alıp, her bir talep kalemini ayrı bir satır yapacak şekilde formatlayarak bir Excel dosyası oluşturur ve indirir.