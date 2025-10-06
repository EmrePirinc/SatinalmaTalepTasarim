# Satınalma Talebi Ekranı Alan Şablonu (Analiz Sonrası Nihai Versiyon)

Bu belge, web arayüzü, SAP B1 veritabanı alanları ve gerekli Kullanıcı Tanımlı Alanlar (KTA/UDF) arasındaki nihai eşleştirmeyi tanımlar.

## Başlık Alanları (OPRQ & KTA'lar)

| Web Alanı Adı / Mantık | SAP Tablo & Alan | Web'de Görünür | Salt Okunur | Zorunlu | Açıklama ve Notlar |
| --- | --- | --- | --- | --- | --- |
| Talep Eden Türü | `OPRQ.Reqtype` | Hayır | - | - | Arka planda varsayılan değer olarak `12` atanacak. |
| Talep Eden Kullanıcı | `OPRQ.Requester` | Evet | Evet | - | Sisteme giriş yapan kullanıcının SAP ID'si ile otomatik dolar. |
| Talep Eden Adı Soyadı | `OPRQ.Reqname` | Evet | Evet | - | Sisteme giriş yapan kullanıcının adı ve soyadı ile otomatik dolar. |
| Kullanıcı Departmanı | `OPRQ.Department` | Evet | Evet | - | Kullanıcının ana departmanını gösterir. Satır bazında masraf merkezi ayrıca seçilir. |
| Şube | `OPRQ.Branch` | Hayır | - | - | Arka planda varsayılan değer olarak "Ana" (`-2`) atanacak. |
| Belge Numarası | `OPRQ.DocNum` | Evet | Evet | - | Belge kaydedildikten sonra SAP tarafından atanır. |
| Kayıt Tarihi | `OPRQ.DocDate` | Evet | Evet | - | Otomatik olarak günün tarihini alır. |
| Geçerlilik Bitişi | `OPRQ.DocDueDate` | Evet | Evet | - | Otomatik olarak kayıt tarihinden 1 ay sonrası olarak ayarlanır. |
| Belge Tarihi | `OPRQ.TaxDate` | Evet | Hayır | Evet | Kayıt tarihi ile aynı başlar, kullanıcı değiştirebilir. |
| Gerekli Tarih | `OPRQ.Reqdate` | Evet | Hayır | Evet | Talebin geneli için gerekli tarih. |
| Genel Açıklamalar | `OPRQ.Comments` | Evet | Hayır | Hayır | Talebin geneli için notlar (`task-form`'daki `notes` alanı). |
| Seri | `OPRQ.Series` | Hayır | - | - | Arka planda varsayılan değer olarak `56` atanacak. |
| **Talep Özeti** | `OPRQ.U_TalepOzeti` | Evet | Hayır | Hayır | **(KTA)** Web formundaki "Talep Özeti" alanı için. Metin türünde. |
| **Acil Talep** | `OPRQ.U_AcilMi` | Evet | Hayır | Hayır | **(KTA)** Web formundaki "Acil Talep" seçeneği için. "Y"/"N" (Evet/Hayır) türünde. |
| **Talep Durumu** | `OPRQ.U_TalepDurum` | Evet | Evet | - | **(KTA)** "Revize İstendi", "Reddedildi" gibi özel durumları yönetmek için. |
| **Revize Nedeni** | `OPRQ.U_RevizeNedeni` | Evet | Evet | - | **(KTA)** Talep revizeye gönderildiğinde doldurulacak metin alanı. |
| **Red Nedeni** | `OPRQ.U_RedNedeni` | Evet | Evet | - | **(KTA)** Talep reddedildiğinde doldurulacak metin alanı. |

## Satır Alanları (PRQ1)

| Web Alanı Adı | SAP Tablo & Alan | Web'de Görünür | Salt Okunur | Zorunlu | Açıklama ve Notlar |
| --- | --- | --- | --- | --- | --- |
| Kalem Kodu | `PRQ1.ItemCode` | Evet | Hayır | Evet | Kullanıcı listeden seçer veya manuel girer. |
| Kalem Tanımı | `PRQ1.ItemName` | Evet | Evet | - | Kalem Kodu seçildiğinde otomatik olarak dolar. |
| **Departman / Masraf Merkezi** | `PRQ1.OcrCode` | Evet | Hayır | Evet | **(Güncellendi)** Web'deki "Departman" alanı, SAP'deki "Masraf Merkezi" alanına eşlenmiştir. |
| Satır Açıklaması | `PRQ1.FreeTxt` | Evet | Hayır | Hayır | **(Güncellendi)** Web'deki satır açıklaması için SAP'nin standart `FreeTxt` alanı kullanılacaktır. |
| Satıcı Kodu | `PRQ1.VendorCode` | Evet | Hayır | Hayır | Her satır için farklı satıcı seçilebilir. |
| Gerekli Tarih (Satır) | `PRQ1.PQTRegdate` | Evet | Hayır | Evet | Her satır için kullanıcı tarafından girilir. |
| Miktar | `PRQ1.Quantity` | Evet | Hayır | Evet | Kullanıcı tarafından girilir. |
| Ölçü Birimi | `PRQ1.UomCode` | Evet | Hayır | Evet | Genellikle kaleme bağlı gelir ama seçilebilir olmalı. |
| **Ek Dosya** | `ATC1` Tablosu | Evet | Hayır | Hayır | Dosyalar `ATC1` tablosunda yönetilir. **Not:** Web'den yüklenen dosyanın `PRQ1` satırına bağlanması için özel bir entegrasyon gerekir. |