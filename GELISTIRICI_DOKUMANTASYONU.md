> **Not:** Bu doküman, satınalma talebi yönetimi uygulamasının fonksiyonel gereksinimlerini ve iş kurallarını tanımlamak amacıyla oluşturulmuştur. Mevcut bir kod tabanını açıklamamaktadır; bunun yerine, projeyi sıfırdan geliştirecek bir yazılımcı için bir kılavuz niteliğindedir. Geliştirici, burada belirtilen işlevselliği, kendi tercih ettiği teknoloji ve mimari yaklaşımlarla hayata geçirebilir.

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
| **Kalem Kodu** | `OITM.ItemCode` | Evet | Hayır | Bir listeden seçilebilir veya manuel girilebilir olmalıdır. |
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
| **admin** (Yönetici) | Tüm yetkilere sahip kullanıcı. | - `purchaser` ile aynı yetkilere sahiptir. |

---

## 4. Talep Açma Süreci ve İş Kuralları

### 4.1. Zorunlu Alanlar
Formun kaydedilebilmesi için "Zorunlu" olarak işaretlenmiş tüm başlık ve satır alanları doldurulmalıdır.

### 4.2. Tarih Alanlarının Etkileşimi
- **Senaryo: Başlık "Gerekli Tarih" alanını değiştirmek.**
  - **Eğer satırlarda daha önceden girilmiş tarihler varsa:** Kullanıcıya "Mevcut satırların tarihlerini de güncellemek istiyor musunuz?" diye sorulmalıdır.
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
- **Revize Süreci:**
  1. Satınalmacı, bir talebi "Revize İste" butonu ile ve bir neden belirterek revizeye gönderebilmelidir.
  2. Talebin durumu "Revize İstendi" olarak güncellenmelidir.
  3. Talep sahibi, listesinde bu talebi gördüğünde, detay penceresinde "Düzenle ve Tekrar Gönder" butonu aktif olmalıdır.
  4. Bu butona tıkladığında, talep formu bu talebin bilgileriyle dolu şekilde açılmalı ve düzenlemeye olanak tanımalıdır.
- **Reddetme Süreci:**
  1. Satınalmacı, bir talebi "Reddet" butonu ile ve bir neden belirterek reddedebilmelidir.
  2. Talebin durumu "Reddedildi" olarak güncellenmeli ve bu talep için iş akışı sonlanmalıdır.