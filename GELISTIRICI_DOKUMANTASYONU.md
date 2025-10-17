# Satınalma Talep Yönetim Sistemi - Fonksiyonel Gereksinimler

## 1. Projenin Amacı ve Genel Bakış

Bu proje, SAP sistemiyle entegre çalışacak web tabanlı bir satınalma talebi yönetim sistemi oluşturmayı amaçlamaktadır. Kullanıcıların kolayca satınalma talepleri oluşturmasına, bu talepleri takip etmesine ve ilgili onay süreçlerini yönetmesine olanak tanır.

- **Ana Modüller:**
    - Kullanıcı Giriş Ekranı
    - Satınalma Talep Formu
    - Talep Listesi Ekranı

---

## 2. Sayfa Yapıları ve Fonksiyonları

### 2.1. Satınalma Talep Formu

Bu ekran, yeni satınalma talepleri oluşturmak veya mevcut talepleri düzenlemek için kullanılır.

<img width="1794" height="896" alt="image" src="https://github.com/user-attachments/assets/1cec00ee-7ca1-469c-926b-a7cec0b20cb9" />

**Sayfanın Amacı:** Kullanıcının gerekli tüm bilgileri girerek bir satınalma talebi oluşturmasını sağlamak.

**Beklenen Fonksiyonlar:**
- Yeni bir talep oluşturulabilmelidir.
- "Revize İstendi" durumundaki bir talep, bu formda bilgileri dolu şekilde açılarak düzenlenebilmelidir.
- Form alanları dinamik olarak yönetilebilmelidir (örn: satır ekleme/silme).
- Kaydetme işleminden önce zorunlu alanların dolu olup olmadığı kontrol edilmelidir.
- "Kalem" ve "Satıcı" gibi verilerin seçimi için yardımcı pencereler (popup/dialog) açılabilmelidir.

**Başlık Alanları (Header):**

| Web Alanı Adı | SAP Alanı | Zorunlu | Salt Okunur | İş Kuralları ve Notlar |
| :--- | :--- | :---: | :---: | :--- |
| **Doküman No** | `OPRQ.DocNum` | Evet | Evet | Sistem tarafından otomatik olarak atanmalıdır (örneğin, bir önceki numaranın bir fazlası). |
| **Talep Eden** | `OPRQ.Reqname` | Evet | Evet | Sisteme giriş yapan kullanıcının adı ile otomatik olarak doldurulmalıdır. |
| **Belge Tarihi** | `OPRQ.TaxDate` | Evet | Hayır | Varsayılan olarak günün tarihini almalı, ancak kullanıcı tarafından değiştirilebilmelidir. |
| **Gerekli Tarih**| `OPRQ.Reqdate` | Evet | Hayır | Talebin geneli için geçerli olan tarih. Bu tarih değiştiğinde satırları etkileme kuralı aşağıda detaylandırılmıştır. |
| **Geçerlilik T.**| `OPRQ.DocDueDate`| Evet | Hayır | Kullanıcı tarafından manuel olarak girilmelidir. |
| **Talep Özeti** | `OPRQ.U_TalepOzeti`| Evet | Hayır | Talebi özetleyen kısa bir metin alanı. |
| **Acil Talep** | `OPRQ.U_AcilMi` | Hayır | Hayır | Kullanıcının talebin acil olup olmadığını belirtebileceği bir "Evet/Hayır" seçeneği (örn: checkbox, switch). |
| **Açıklamalar** | `OPRQ.Comments` | Hayır | Hayır | Talebin geneli için uzun notların girilebileceği bir metin alanı. |

**Satır Alanları (Lines):**

| Web Alanı Adı | SAP Alanı | Zorunlu | Salt Okunur | İş Kuralları ve Notlar |
| :--- | :--- | :---: | :---: | :--- |
| **Kalem Kodu** | `OITM.ItemCode` | Evet | Evet | Bir listeden seçilebilir olmalıdır. Kalem tanımı seçilir ise otomatik dolmalıdır.|
| **Kalem Tanımı**| `OITM.ItemName` | Evet | Evet | Kalem Kodu seçildiğinde sistem tarafından otomatik olarak doldurulmalıdır. |
| **Gerekli Tarih**| `PRQ1.PQTRegdate`| Evet | Hayır | Her satır için ayrı tarih girilebilmelidir. Yeni satır eklendiğinde, başlık "Gerekli Tarih" alanından bu değeri almalıdır. |
| **Miktar** | `PRQ1.Quantity` | Evet | Hayır | Sayısal bir değer girilmelidir. |
| **Ölçü Birimi**| `PRQ1.UomCode` | Evet | Hayır | Bir listeden (AD, KG, LT vb.) seçilebilmelidir. |
| **Satıcı Kodu** | `PRQ1.VendorCode`| Hayır | Evet | Bir satıcı listesinden seçilmelidir. Alanın kendisi düzenlenemez, sadece seçim penceresi ile değiştirilebilir olmalıdır. |
| **Departman** | `PRQ1.OcrCode` | Evet | Hayır | Bir departman listesinden (Konsol, Bakır vb.) seçilebilmelidir. |
| **Satır Açıklama**| `PRQ1.FreeTxt` | Hayır | Hayır | Satıra özel notlar için bir metin alanı. |
| **Ek Dosya** | `ATC1` Tablosu | Hayır | Hayır | Kullanıcının her satır için dosya ekleyebilmesi sağlanmalıdır. |

### 2.2. Talep Listesi Ekranı

Oluşturulan tüm satınalma taleplerinin görüntülendiği, filtrelendiği ve yönetildiği ana ekrandır.

> **[GÖRSEL EKLENECEK: Talep Listesi Genel Görünüm]**
<img width="1794" height="904" alt="image" src="https://github.com/user-attachments/assets/7bea32f9-ec8b-4064-a458-230be1979cba" />

> *Açıklama: Bu alana, farklı durumlarda (örn: "Revize İstendi", "Reddedildi", "Satınalmacıda") birkaç talebin listelendiği tablo görünümünün ekran görüntüsü eklenmelidir. Filtreleme ve arama alanları da bu görselde yer almalıdır.*

**Sayfanın Amacı:** Kullanıcılara rollerine göre ilgili talepleri göstermek, durumlarını takip etme ve talepler üzerinde işlem yapma imkanı sunmak.

**Beklenen Fonksiyonlar:**
- Talepler bir tablo veya liste formatında, sayfalanarak gösterilmelidir.
- Kullanıcılar, listedeki tüm kolonlara göre arama ve filtreleme yapabilmelidir.
- Listeden bir talebe tıklandığında, tüm detaylarını içeren bir popup açılmalıdır.
- Rol bazlı işlem butonları (Reddet, Revize İste vb.) bulunmalıdır.
- Görüntülenen listenin Excel formatında dışa aktarımı sağlanmalıdır.

**Liste Kolonları:**

| Web Alanı Adı | SAP Alanı | Notlar |
| :--- | :--- | :--- |
| **Doküman No** | `OPRQ.DocNum` | Talebin benzersiz numarası. |
| **Talep Özeti** | `OPRQ.U_TalepOzeti` | Talebin kısa özeti. |
| **Talep Eden** | `OPRQ.Reqname` | Talebi oluşturan kullanıcının adı. |
| **Departman** | `PRQ1.OcrCode` | Talebin genel departmanı. |
| **Belge Tarihi** | `OPRQ.TaxDate` | |
| **Gerekli Tarih** | `OPRQ.Reqdate` | |
| **Geçerlilik T.**| `OPRQ.DocDueDate`| |
| **Kayıt Tarihi** | `OPRQ.DocDate` | Talebin sisteme girildiği tarih. |
| **Acil Talep** | `OPRQ.U_AcilMi` | Acil ise görsel bir belirteç (ikon, renk vb.) ile gösterilmelidir. |
| **Talep Durumu** | `OPRQ.U_TalepDurum` | Talebin mevcut durumu (örn: "Onay Bekliyor", "Reddedildi"). Duruma göre görsel olarak ayrıştırılmalıdır. |
| **Revize/Red Nedeni**| `OPRQ.U_RevizeNedeni`, `OPRQ.U_RedNedeni`| Bu bilgiler direkt bir kolon yerine, talep detayı popup'ında gösterilmelidir. |

---

## 3. Yetkilendirme ve Roller

Sistemde üç temel kullanıcı rolü bulunmalıdır:

| Rol | Açıklama | Beklenen Yetkiler |
| :--- | :--- | :--- |
| **user** (Talep Açan) | Standart kullanıcı. | - Yeni talep oluşturabilir.<br>- Talep listesinde sadece kendi oluşturduğu talepleri görebilir.<br>- Durumu "Revize İstendi" olan kendi talebini düzenleyebilir. |
| **purchaser** (Satınalmacı) | Onay ve işlem yetkisine sahip kullanıcı. | - Yeni talep oluşturabilir.<br>- Talep listesinde tüm kullanıcıların taleplerini görebilir.<br>- Taleplerin durumunu "Reddedildi" veya "Revize İstendi" olarak güncelleyebilir. |
| **admin** (Yönetici) | Tüm yetkilere sahip kullanıcı. | - `purchaser` ile aynı yetkilere sahiptir. Ek olarak ise Kullanıcı Yönetimi ekranında yetkili kullanıcıları ekleyip çıkarabilir. |

---

## 4. Talep Açma Süreci ve İş Kuralları

### 4.1. Zorunlu Alanlar
Formun kaydedilebilmesi için "Zorunlu" olarak işaretlenmiş tüm başlık ve satır alanları doldurulmalıdır.

### 4.2. Tarih Alanlarının Etkileşimi

- **Senaryo: Başlık "Gerekli Tarih" alanını değiştirmek.**
  - **Eğer satırlarda daha önceden girilmiş tarihler varsa:** Kullanıcıya "Mevcut satırların tarihlerini de güncellemek istiyor musunuz?" diye sorulmalıdır.

> **[GÖRSEL EKLENECEK: Tarih Güncelleme Onay Mesajı]**
> *Açıklama: Bu alana, başlık "Gerekli Tarih" alanı değiştirildiğinde çıkan onay mesajının (confirm dialog) ekran görüntüsü eklenmelidir.*

    - **Evet denirse:** Tüm satırların tarihi, başlıkta girilen yeni tarih ile güncellenmelidir.
    - **Hayır denirse:** Mevcut satırlar korunmalı, sadece bu adımdan sonra eklenecek yeni satırlar bu yeni tarihi almalıdır.
  - **Eğer satırlarda hiç tarih girilmemişse:** Tüm satırların tarihi otomatik olarak başlıkta girilen tarihle doldurulmalıdır.

- **Senaryo: Yeni satır eklemek.**
  - Yeni eklenen satırın "Gerekli Tarih" alanı, başlıkta o an seçili olan "Gerekli Tarih" değeriyle otomatik olarak doldurulmalıdır.

### 4.3. Diğer Kurallar
- Bir talepte en az bir satır bulunması zorunludur. Son satır silinememelidir.
- "Kalem Tanımı" alanı, "Kalem Kodu" seçildiğinde sistem tarafından doldurulduğu için kullanıcı tarafından doğrudan düzenlenememelidir.

---

## 5. Talep Listesi ve İş Akışları

- **Detay Görüntüleme:** Listeden bir talebe tıklandığında, o talebin tüm başlık ve satır bilgilerini içeren bir detay penceresi açılmalıdır.

> **[GÖRSEL EKLENECEK: Talep Detayları Penceresi]**
> <img width="1920" height="1274" alt="image" src="https://github.com/user-attachments/assets/33122b28-958e-4e90-a9f3-9b9112b9158b" />

> *Açıklama: Bu alana, bir talebe tıklandığında açılan ve talebin tüm başlık, satır ve not bilgilerini gösteren detay popup'ının ekran görüntüsü eklenmelidir.*

- **Revize ve Reddetme Süreci:**
  1. Satınalmacı, bir talebi "Revize İste" veya "Reddet" butonları ile ve bir neden belirterek işleme alabilmelidir.

> **[GÖRSEL EKLENECEK: Revize/Reddetme Penceresi]**
> <img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/56601d95-6a5d-4a48-a517-e59541211ace" />

  2. Talebin durumu buna göre ("Revize İstendi" veya "Reddedildi") güncellenmelidir.
  3. Talep sahibi, durumu "Revize İstendi" olan talebi için detay penceresinde "Düzenle ve Tekrar Gönder" butonu görmelidir.
  4. Bu butona tıkladığında, talep formu bu talebin bilgileriyle dolu şekilde açılmalı ve düzenlemeye olanak tanımalıdır.


**NOT**

  📊 STATE ALANLARI (useState)

  | Alan Adı           | Tip                    | Kullanım Amacı                                               |
  |--------------------|------------------------|--------------------------------------------------------------|
  | currentUser        | any                    | Giriş yapmış kullanıcının bilgilerini tutar (id, name, role) |
  | isSidebarOpen      | boolean                | Sidebar'ın açık/kapalı durumunu kontrol eder                 |
  | searchQuery        | string                 | Genel arama kutusundaki değeri tutar                         |
  | requests           | PurchaseRequest[]      | Backend'den gelen tüm satınalma taleplerini tutar            |
  | selectedRequest    | PurchaseRequest | null | Detay modalında gösterilecek seçili talebi tutar             |
  | isDetailDialogOpen | boolean                | Talep detay modalının açık/kapalı durumu                     |
  | isRejectDialogOpen | boolean                | Reddetme modalının açık/kapalı durumu                        |
  | isReviseDialogOpen | boolean                | Revize modalının açık/kapalı durumu                          |
  | rejectReason       | string                 | Reddetme sebebi text alanı                                   |
  | reviseReason       | string                 | Revize sebebi text alanı                                     |
  | filters            | object                 | Tüm tablo kolonları için filtre değerlerini tutar            |
  | currentPage        | number                 | Sayfalama için aktif sayfa numarası                          |
  | itemsPerPage       | number                 | Sayfada gösterilecek kayıt sayısı (10, 20, 50, 100)          |

  🔧 FONKSIYONLAR

  | Fonksiyon Adı             | Parametreler                | Kullanım Amacı
                                       |
  |---------------------------|-----------------------------|-------------------------------------------------------
  -------------------------------------|
  | formatDate                | dateStr: string | undefined | Tarih formatını YYYY-MM-DD veya DD.MM.YYYY'den
  DD/MM/YYYY'ye çevirir                       |
  | fetchCurrentUser          | -                           | localStorage'dan userId'yi alıp backend'den kullanıcı
  bilgilerini çeker                    |
  | fetchRequestsFromBackend  | user: any                   | Backend API'den talepleri çeker, SAP formatına uygun
  şekilde parse eder ve state'e yazar   |
  | filteredRequests          | -                           | useMemo ile hesaplanan, searchQuery ve filters'a göre
  filtrelenmiş talep listesi           |
  | paginatedRequests         | -                           | useMemo ile hesaplanan, sayfalama uygulanmış talep
  listesi                                 |
  | handleLogout              | -                           | localStorage'ı temizleyip login sayfasına yönlendirir
                                       |
  | handleViewDetails         | request: PurchaseRequest    | Seçili talebi state'e atar ve detay modalını açar
                                       |
  | handleRejectClick         | -                           | Reddetme modalını açar
                                       |
  | handleRejectConfirm       | -                           | Talebi "Reddedildi" durumuna getirir, backend'e PUT
  request gönderir                       |
  | handleReviseClick         | -                           | Revize modalını açar
                                       |
  | handleReviseConfirm       | -                           | Talebi "Revize İstendi" durumuna getirir, backend'e
  PUT request gönderir                   |
  | handleEditAndResubmit     | -                           | Revize edilen talebi düzenlemek için ana form
  sayfasına yönlendirir                        |
  | handleExportToExcel       | -                           | Filtrelenmiş talep listesinin tamamını ExcelJS ile
  stilize edilmiş Excel dosyasına çevirir |
  | handleExportDetailToExcel | request: PurchaseRequest    | Seçili talebin detayını (header + items) iki bölümlü
  Excel dosyasına çevirir               |

  📦 TYPE TANIMLAMALARI

  | Type Adı        | Alanlar                                              | Kullanım Amacı
         |
  |-----------------|------------------------------------------------------|----------------------------------------
  -------|
  | RequestStatus   | 11 farklı durum (Satınalmacıda, Revize İstendi, vb.) | Talebin iş akışındaki durumunu tanımlar
         |
  | RequestItem     | OcrCode, ItemCode, ItemName, Quantity, UomCode, vb.  | SAP PRQ1 tablosu kalem satırı (line
  item)     |
  | PurchaseRequest | DocNum, Reqname, U_TalepDurum, items[], vb.          | SAP OPRQ tablosu ana talep bilgileri
  (header) |
  | statusColors    | Record<RequestStatus, string>                        | Her durum için TailwindCSS renk
  class'ları    |

  🎨 COMPUTED/DERIVED VALUES

  | Değişken Adı | Hesaplama                                         | Kullanım Amacı               |
  |--------------|---------------------------------------------------|------------------------------|
  | totalPages   | Math.ceil(filteredRequests.length / itemsPerPage) | Toplam sayfa sayısı          |
  | startIndex   | (currentPage - 1) * itemsPerPage                  | Sayfadaki ilk kaydın index'i |
  | endIndex     | startIndex + itemsPerPage                         | Sayfadaki son kaydın index'i |

  🔗 API ENDPOINTLERİ

  | Endpoint                                               | Method | Kullanım Amacı                           |
  |--------------------------------------------------------|--------|------------------------------------------|
  | http://localhost:3001/api/auth/me/${userId}            | GET    | Kullanıcı bilgilerini çeker              |
  | http://localhost:3001/api/requests?userId=X&userRole=Y | GET    | Kullanıcıya özel talep listesini çeker   |
  | http://localhost:3001/api/requests/${id}               | PUT    | Talep durumunu günceller (Reddet/Revize) |

  📋 FİLTRE ALANLARI (filters object)

  | Alan Adı     | SAP Karşılığı            | Filtre Tipi             |
  |--------------|--------------------------|-------------------------|
  | DocNum       | OPRQ.DocNum              | Text input              |
  | U_TalepOzeti | OPRQ.U_TalepOzeti        | Text input              |
  | Reqname      | OPRQ.Reqname             | Text input              |
  | OcrCode      | PRQ1.OcrCode (items'dan) | Text input              |
  | TaxDate      | OPRQ.TaxDate             | Date input              |
  | Reqdate      | OPRQ.Reqdate             | Date input              |
  | DocDueDate   | OPRQ.DocDueDate          | Date input              |
  | DocDate      | OPRQ.DocDate             | Text input (DD/MM/YYYY) |
  | U_TalepDurum | OPRQ.U_TalepDurum        | Select dropdown         |

  Bu tablo, Talep Listesi ekranındaki tüm veri yapısını, fonksiyonları ve kullanım amaçlarını göstermektedir.
  Herhangi bir alanın detayına ihtiyacınız olursa sorabilirsiniz!
