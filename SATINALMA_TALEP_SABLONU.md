# Satınalma Talebi Ekranı Alan Şablonu

Bu belge, web arayüzünde yer alacak satınalma talebi ekranının alanlarını ve bu alanların SAP B1 veritabanındaki karşılıklarını tanımlar.

## Başlık Alanları (OPRQ)

| Web Alanı Adı | SAP Tablo & Alan | Açıklama | Zorunlu | Notlar |
| --- | --- | --- | --- | --- |
| Talep Eden Türü | `OPRQ.Reqtype` | Kullanıcı/çalışan. Her zaman "kullanıcı" seçili olacak. | Hayır | SQL'de `12` değerini alır. |
| Talep Eden Kullanıcı | `OPRQ.Requester` | Malı talep eden kullanıcının SAP ID'si. | Hayır | |
| Talep Eden Adı Soyadı | `OPRQ.Reqname` | Talep eden kullanıcının adı ve soyadı. | Hayır | |
| Departman | `OUDP.Name` | Talep edenin departmanı. | Hayır | `OPRQ` ve `OUDP` tabloları join edilerek alınır: `T0.[Department] = T1.[Code]` |
| Şube | `OPRQ.Branch` | Her zaman "Ana" seçili olacak. | Hayır | SQL'de `–2` olarak tutuluyor. |
| Belge Numarası | `OPRQ.DocNum` | Satınalma talebi belge numarası. | Hayır | SAP tarafından otomatik atanır. |
| Kayıt Tarihi | `OPRQ.DocDate` | Belgenin oluşturulduğu tarih. | Hayır | Otomatik olarak günün tarihini alır (`GETDATE()`), değiştirilemez. |
| Geçerlilik Bitişi | `OPRQ.DocDueDate` | Talebin geçerliliğinin sona ereceği tarih. | Hayır | Otomatik olarak kayıt tarihinden 1 ay sonrası olarak ayarlanır. |
| Belge Tarihi | `OPRQ.TaxDate` | Kayıt tarihi ile aynı başlar, ancak sonradan değiştirilebilir. | Hayır | |
| Gerekli Tarih | `OPRQ.Reqdate` | Talebin genel olarak ne zaman gerekli olduğu. | Evet | Kullanıcı tarafından girilir. |
| Açıklamalar | `OPRQ.Comments` | Taleple ilgili genel açıklamalar. | Evet | Kullanıcı tarafından girilir. |
| Satıcı | `OPRQ.LineVendor` | Her satıra farklı satıcı girilebileceğini belirtir. | Hayır | Bu alan başlıkta mı yoksa satırda mı olmalı? Genellikle satırda olur. |
| Seri | `OPRQ.Series` | Talep serisi. | Hayır | Varsayılan olarak `56` yazmalı. |

## Satır Alanları (PRQ1)

| Web Alanı Adı | SAP Tablo & Alan | Açıklama | Zorunlu | Notlar |
| --- | --- | --- | --- | --- |
| Kalem Kodu | `PRQ1.ItemCode` | Ürünün veya hizmetin kodu. | Evet | Kalem tanımı seçilince otomatik gelir. |
| Kalem Tanımı | `PRQ1.ItemName` | Ürünün veya hizmetin açıklaması. | Hayır | Kalem kodu seçilince otomatik gelir. |
| Gerekli Tarih (Satır) | `PRQ1.PQTRegdate` | Bu satırdaki kalemin ne zaman gerekli olduğu. | Evet | Her satır için farklı tarih girilebilir. |
| Miktar | `PRQ1.Quantity` | Talep edilen miktar. | Evet | Format: Virgülden sonra iki hane (örn: 10,00). |
| Ölçü Birimi | `PRQ1.UomCode` | Kalemin ölçü birimi (Adet, Kg, etc.). | Evet | |
| Masraf Merkezi | `PRQ1.OcrCode` | Masrafın yükleneceği merkez. | Hayır | Alan doğruluğu kontrol edilecek. |