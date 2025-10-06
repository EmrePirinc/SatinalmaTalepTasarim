# Satınalma Talebi Ekranı Alan Şablonu

Bu belge, web arayüzünde yer alacak satınalma talebi ekranının alanlarını, SAP B1 veritabanı karşılıklarını ve web'deki davranışlarını tanımlar.

## Başlık Alanları (OPRQ)

| Web Alanı Adı | SAP Tablo & Alan | Web'de Görünür | Salt Okunur | Zorunlu | Açıklama ve Notlar |
| --- | --- | --- | --- | --- | --- |
| Talep Eden Türü | `OPRQ.Reqtype` | Hayır | - | - | Arka planda varsayılan değer olarak `12` atanacak. |
| Talep Eden Kullanıcı | `OPRQ.Requester` | Evet | Evet | - | Sisteme giriş yapan kullanıcının SAP ID'si ile otomatik dolar. |
| Talep Eden Adı Soyadı | `OPRQ.Reqname` | Evet | Evet | - | Sisteme giriş yapan kullanıcının adı ve soyadı ile otomatik dolar. |
| Departman | `OUDP.Name` | Evet | Evet | - | Kullanıcının departmanı ile otomatik dolar. **SAP Join:** `OPRQ T0 INNER JOIN OUDP T1 ON T0.Department = T1.Code` |
| Şube | `OPRQ.Branch` | Hayır | - | - | Arka planda varsayılan değer olarak "Ana" (`-2`) atanacak. |
| Belge Numarası | `OPRQ.DocNum` | Evet | Evet | - | Belge kaydedildikten sonra SAP tarafından atanır, başlangıçta boştur. |
| Kayıt Tarihi | `OPRQ.DocDate` | Evet | Evet | - | Otomatik olarak günün tarihini alır (`GETDATE()`), değiştirilemez. |
| Geçerlilik Bitişi | `OPRQ.DocDueDate` | Evet | Evet | - | Otomatik olarak kayıt tarihinden 1 ay sonrası olarak ayarlanır. |
| Belge Tarihi | `OPRQ.TaxDate` | Evet | Hayır | Evet | Kayıt tarihi ile aynı başlar, ancak kullanıcı tarafından değiştirilebilir. |
| Gerekli Tarih | `OPRQ.Reqdate` | Evet | Hayır | Evet | Kullanıcı tarafından girilen genel gerekli tarih. |
| Açıklamalar | `OPRQ.Comments` | Evet | Hayır | Hayır | Kullanıcı tarafından girilen genel notlar. |
| Seri | `OPRQ.Series` | Hayır | - | - | Arka planda varsayılan değer olarak `56` atanacak. |

## Satır Alanları (PRQ1)

| Web Alanı Adı | SAP Tablo & Alan | Web'de Görünür | Salt Okunur | Zorunlu | Açıklama ve Notlar |
| --- | --- | --- | --- | --- | --- |
| Kalem Kodu | `PRQ1.ItemCode` | Evet | Hayır | Evet | Kullanıcı listeden seçer veya manuel girer. |
| Kalem Tanımı | `PRQ1.ItemName` | Evet | Evet | - | Kalem Kodu seçildiğinde otomatik olarak dolar. |
| Satıcı Kodu | `PRQ1.VendorCode` | Evet | Hayır | Hayır | Her satır için farklı satıcı seçilebilir. Orijinal notta `OPRQ.LineVendor` belirtilmişti, ancak bu mantık satır seviyesindedir. |
| Gerekli Tarih (Satır) | `PRQ1.PQTRegdate` | Evet | Hayır | Evet | Her satır için kullanıcı tarafından girilir. |
| Miktar | `PRQ1.Quantity` | Evet | Hayır | Evet | Kullanıcı tarafından girilir. Format: `,00`. |
| Ölçü Birimi | `PRQ1.UomCode` | Evet | Hayır | Evet | Genellikle kaleme bağlı gelir ama listeden seçilebilir olmalı. |
| Masraf Merkezi | `PRQ1.OcrCode` | Evet | Hayır | Evet | Kullanıcı listeden seçer. Alan doğruluğu kontrol edilmeli. |