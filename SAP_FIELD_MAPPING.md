# SAP Business One Alan Eşleştirme Raporu

## ✅ Veritabanı Yapısı - SAP B1 Uyumlu

### 1. OPRQ (Purchase Requests - Başlık) Tablosu

| Frontend Alan | Veritabanı Alan | SAP B1 Alan | Açıklama | Durum |
|--------------|----------------|------------|----------|-------|
| documentNumber | doc_num | OPRQ.DocNum | Doküman Numarası | ✅ Eşleşti |
| requester | req_name | OPRQ.Reqname | Talep Eden | ✅ Eşleşti |
| documentDate | tax_date | OPRQ.TaxDate | Belge Tarihi | ✅ Eşleşti |
| requiredDate | req_date | OPRQ.Reqdate | Gerekli Tarih | ✅ Eşleşti |
| validityDate | doc_due_date | OPRQ.DocDueDate | Geçerlilik Tarihi | ✅ Eşleşti |
| createdDate | doc_date | OPRQ.DocDate | Kayıt Tarihi | ✅ Eşleşti |
| department | department | PRQ1.OcrCode | Departman (İlk satırdan) | ✅ Eşleşti |
| itemCount | item_count | - | Kalem Sayısı | ✅ Eşleşti |
| status | status | OPRQ.U_TalepDurum | Talep Durumu | ✅ Eşleşti |
| isUrgent | u_acil_mi | OPRQ.U_AcilMi | Acil Mi? | ✅ Kullanıcı Tanımlı |
| requestSummary | u_talep_ozeti | OPRQ.U_TalepOzeti | Talep Özeti | ✅ Kullanıcı Tanımlı |
| revisionReason | u_revize_nedeni | OPRQ.U_RevizeNedeni | Revize Nedeni | ✅ Kullanıcı Tanımlı |
| rejectionReason | u_red_nedeni | OPRQ.U_RedNedeni | Red Nedeni | ✅ Kullanıcı Tanımlı |
| notes | comments | OPRQ.Comments | Açıklamalar/Notlar | ✅ Eşleşti |
| requesterRole | requester_role | - | Talep Eden Rolü | ✅ Ek Alan |

### 2. PRQ1 (Purchase Request Items - Satırlar) Tablosu

| Frontend Alan | Veritabanı Alan | SAP B1 Alan | Açıklama | Durum |
|--------------|----------------|------------|----------|-------|
| itemCode | item_code | OITM.ItemCode | Kalem Kodu | ✅ Eşleşti |
| itemName | item_name | OITM.ItemName | Kalem Tanımı | ✅ Eşleşti |
| requiredDate | pqt_regdate | PRQ1.PQTRegdate | Gerekli Tarih | ✅ Eşleşti |
| quantity | quantity | PRQ1.Quantity | Miktar | ✅ Eşleşti |
| uomCode | uom_code | PRQ1.UomCode | Ölçü Birimi Kodu | ✅ Eşleşti |
| vendor | vendor_code | PRQ1.VendorCode | Satıcı Kodu | ✅ Eşleşti |
| departman | ocr_code | PRQ1.OcrCode | Departman/Maliyet Merkezi | ✅ Eşleşti |
| description | free_txt | PRQ1.FreeTxt | Satır Açıklama | ✅ Eşleşti |
| isDummy | is_dummy | - | Dummy Kalem Mi? | ✅ Ek Alan |

### 3. ATC1 (Attachments - Ek Dosyalar) Tablosu

| Veritabanı Alan | SAP B1 Alan | Açıklama | Durum |
|----------------|------------|----------|-------|
| abs_entry | ATC1.AbsEntry | Mutlak Giriş No | ✅ Yeni Eklendi |
| line_num | ATC1.LineNum | Satır No | ✅ Yeni Eklendi |
| src_path | ATC1.SrcPath | Kaynak Dosya Yolu | ✅ Yeni Eklendi |
| trgt_path | ATC1.TrgtPath | Hedef Dosya Yolu | ✅ Yeni Eklendi |
| file_name | ATC1.FileName | Dosya Adı | ✅ Yeni Eklendi |
| file_ext | ATC1.FileExt | Dosya Uzantısı | ✅ Yeni Eklendi |
| file_date | ATC1.FileDate | Dosya Tarihi | ✅ Yeni Eklendi |
| user_sign | ATC1.UserSign | Kullanıcı İmzası | ✅ Yeni Eklendi |
| copied | ATC1.Copied | Kopyalandı mı? | ✅ Yeni Eklendi |
| override | ATC1.Override | Üzerine Yazıldı mı? | ✅ Yeni Eklendi |
| free_text | ATC1.FreeText | Serbest Metin | ✅ Yeni Eklendi |
| request_id | - | Purchase Request ID (FK) | ✅ İlişki |
| item_id | - | Request Item ID (FK) | ✅ İlişki |

### 4. OUSR (Users - Kullanıcılar) Tablosu

| Frontend Alan | Veritabanı Alan | SAP B1 Alan | Açıklama | Durum |
|--------------|----------------|------------|----------|-------|
| sapId | sap_id | OUSR.USERID | SAP Kullanıcı ID | ✅ Eşleşti |
| username | username | - | Kullanıcı Adı | ✅ Login için |
| password | password | - | Şifre | ✅ Login için |
| name | name | OUSR.U_NAME | Ad Soyad | ✅ Eşleşti |
| role | role | - | Rol (user/purchaser/admin) | ✅ Uygulama İçi |
| purchaseAuthority | purchase_authority | - | Satınalma Yetkisi | ✅ Kullanıcı Tanımlı |
| financeAuthority | finance_authority | - | Finans Yetkisi | ✅ Kullanıcı Tanımlı |
| status | status | - | Durum (active/inactive) | ✅ Uygulama İçi |

## 📊 Veritabanı İlişkileri

```
users (OUSR)
  └── purchase_requests (OPRQ)
      ├── request_items (PRQ1)
      │   └── attachments (ATC1) [item level]
      └── attachments (ATC1) [request level]
```

## 🔄 Veri Akışı

### Talep Oluşturma:
1. Frontend → `POST /api/requests`
2. Backend → `purchase_requests` tablosuna insert
3. Backend → Her satır için `request_items` tablosuna insert
4. Backend → Varsa dosyalar için `attachments` tablosuna insert
5. Response → Oluşturulan talep ID döner

### Talep Listeleme:
1. Frontend → `GET /api/requests`
2. Backend → `purchase_requests` + `request_items` JOIN
3. Backend → İlgili `attachments` da çekiliyor
4. Response → Tam talep objesi (items ve attachments ile)

### Talep Güncelleme (Revize):
1. Frontend → `PUT /api/requests/:id`
2. Backend → `purchase_requests` güncellenir
3. Backend → Eski `request_items` siliniir, yenileri eklenir
4. Backend → `u_revize_nedeni` alanı güncellenir
5. Response → Başarılı güncelleme mesajı

## ✅ SAP B1 Uyumluluk Kontrolü

### Zorunlu Alanlar:
- ✅ DocNum (Doküman No)
- ✅ Reqname (Talep Eden)
- ✅ TaxDate (Belge Tarihi)
- ✅ Reqdate (Gerekli Tarih)
- ✅ DocDueDate (Geçerlilik Tarihi)
- ✅ U_TalepOzeti (Talep Özeti)
- ✅ ItemCode (Kalem Kodu)
- ✅ ItemName (Kalem Tanımı)
- ✅ PQTRegdate (Satır Gerekli Tarih)
- ✅ Quantity (Miktar)
- ✅ UomCode (Ölçü Birimi)
- ✅ OcrCode (Departman)

### Opsiyonel Alanlar:
- ✅ VendorCode (Satıcı)
- ✅ FreeTxt (Satır Açıklama)
- ✅ Comments (Açıklamalar)
- ✅ U_AcilMi (Acil Mi?)
- ✅ U_RevizeNedeni (Revize Nedeni)
- ✅ U_RedNedeni (Red Nedeni)

### Kullanıcı Tanımlı Alanlar (UDF):
- ✅ U_AcilMi - Acil talep kontrolü (BOOLEAN)
- ✅ U_TalepOzeti - Talep özeti (TEXT)
- ✅ U_RevizeNedeni - Revize nedeni açıklaması (TEXT)
- ✅ U_RedNedeni - Red nedeni açıklaması (TEXT)
- ✅ U_TalepDurum - Talep durumu (TEXT)

## 📝 Notlar

1. **Tüm SAP B1 alanları eşleştirildi** ✅
2. **Attachments (ATC1) tablosu eklendi** ✅
3. **Kullanıcı tanımlı alanlar (UDF) destekleniyor** ✅
4. **Foreign Key ilişkileri kuruldu** ✅
5. **İndeksler oluşturuldu** ✅
6. **Transaction desteği var** ✅

## 🚀 Sonraki Adımlar

- [ ] Dosya yükleme fonksiyonunu tamamla (ATC1 entegrasyonu)
- [ ] SAP B1 DI API entegrasyonu (opsiyonel)
- [ ] Revize/Red akışını UI'da göster
- [ ] Raporlama ekranları
