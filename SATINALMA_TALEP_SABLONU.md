# Satınalma Talebi Ekranı Alan Şablonu

Bu belge, web arayüzünde yer alacak satınalma talebi ekranının alanlarını ve bu alanların SAP B1 veritabanındaki karşılıklarını tanımlar.

## Başlık Alanları (OPRQ)

| Web Alanı Adı | SAP Tablo & Alan | Açıklama | Notlar |
| --- | --- | --- | --- |
| Talep Eden Türü | `OPRQ.Reqtype` | Kullanıcı/çalışan. Her zaman "kullanıcı" seçili olacak. | SQL'de `12` değerini alır. |
| Talep Eden Kullanıcı | `OPRQ.Requester` | Malı talep eden kullanıcının SAP ID'si. | |
| Talep Eden Adı Soyadı | `OPRQ.Reqname` | Talep eden kullanıcının adı ve soyadı. | |
| Departman | `OUDP.Name` | Talep edenin departmanı. | `OPRQ` ve `OUDP` tabloları join edilerek alınır: `T0.[Department] = T1.[Code]` |
| Şube | `OPRQ.Branch` | Her zaman "Ana" seçili olacak. | SQL'de `–2` olarak tutuluyor. |
| Belge Numarası | `OPRQ.DocNum` | Satınalma talebi belge numarası. | SAP tarafından otomatik atanır. |
| Kayıt Tarihi | `OPRQ.DocDate` | Belgenin oluşturulduğu tarih. | Otomatik olarak günün tarihini alır (`GETDATE()`), değiştirilemez. |
| Geçerlilik Bitişi | `OPRQ.DocDueDate` | Talebin geçerliliğinin sona ereceği tarih. | Otomatik olarak kayıt tarihinden 1 ay sonrası olarak ayarlanır. |
| Belge Tarihi | `OPRQ.TaxDate` | Kayıt tarihi ile aynı başlar, ancak sonradan değiştirilebilir. | |
| Gerekli Tarih | `OPRQ.Reqdate` | Talebin genel olarak ne zaman gerekli olduğu. | Kullanıcı tarafından girilir (*). |
| Açıklamalar | `OPRQ.Comments` | Taleple ilgili genel açıklamalar. | Kullanıcı tarafından girilir (*). |
| Satıcı | `OPRQ.LineVendor` | Her satıra farklı satıcı girilebileceğini belirtir. | Bu alan başlıkta mı yoksa satırda mı olmalı? Genellikle satırda olur. |
| Seri | `OPRQ.Series` | Talep serisi. | Varsayılan olarak `56` yazmalı. |

## Satır Alanları (PRQ1)

| Web Alanı Adı | SAP Tablo & Alan | Açıklama | Notlar |
| --- | --- | --- | --- |
| Kalem Kodu | `PRQ1.ItemCode` | Ürünün veya hizmetin kodu. | Kalem tanımı seçilince otomatik gelir. Kullanıcı tarafından girilir (*). |
| Kalem Tanımı | `PRQ1.ItemName` | Ürünün veya hizmetin açıklaması. | Kalem kodu seçilince otomatik gelir. |
| Gerekli Tarih (Satır) | `PRQ1.PQTReqdate` | Bu satırdaki kalemin ne zaman gerekli olduğu. | Her satır için farklı tarih girilebilir. Kullanıcı tarafından girilir (*). |
| Miktar | `PRQ1.Quantity` | Talep edilen miktar. | Format: Virgülden sonra iki hane (örn: 10,00). Kullanıcı tarafından girilir (*). |
| Ölçü Birimi | `PRQ1.UomCode` | Kalemin ölçü birimi (Adet, Kg, etc.). | Kullanıcı tarafından girilir (*). |
| Masraf Merkezi | `PRQ1.OcrCode` | Masrafın yükleneceği merkez. | Alan doğruluğu kontrol edilecek. |

`(*)` ile işaretlenmiş alanlar kullanıcı tarafından doldurulması zorunlu alanları temsil edebilir. Bu, arayüz tasarımında dikkate alınmalıdır.