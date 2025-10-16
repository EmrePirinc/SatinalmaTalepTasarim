# SAP B1 Alan Eşleme Dokümanı

## 📊 BAŞLIK ALANLARI (OPRQ Tablosu)

| Web Alanı Adı | SAP Alanı | Database Alanı | Zorunlu | Salt Okunur | İş Kuralları |
|--------------|-----------|----------------|---------|-------------|--------------|
| Doküman No | OPRQ.DocNum | doc_num | Evet | Evet | Sistem tarafından otomatik atanır |
| Talep Eden | OPRQ.Reqname | req_name | Evet | Evet | Giriş yapan kullanıcının adı ile otomatik doldurulur |
| Belge Tarihi | OPRQ.TaxDate | tax_date | Evet | Hayır | Varsayılan: Bugünün tarihi |
| Gerekli Tarih | OPRQ.Reqdate | req_date | Evet | Hayır | Talebin genel gerekli tarihi |
| Geçerlilik T. | OPRQ.DocDueDate | doc_due_date | Evet | Hayır | Kullanıcı tarafından manuel girilir |
| Kayıt Tarihi | OPRQ.DocDate | doc_date | Evet | Evet | Sistem tarafından otomatik atanır |
| Talep Özeti | OPRQ.U_TalepOzeti | u_talep_ozeti | Evet | Hayır | Talebi özetleyen kısa metin |
| Acil Talep | OPRQ.U_AcilMi | u_acil_mi | Hayır | Hayır | Boolean (checkbox/switch) |
| Talep Durumu | OPRQ.U_TalepDurum | status | Evet | Evet | Sistem tarafından yönetilir |
| Revize Nedeni | OPRQ.U_RevizeNedeni | u_revize_nedeni | Hayır | Evet | Satınalma tarafından doldurulur |
| Red Nedeni | OPRQ.U_RedNedeni | u_red_nedeni | Hayır | Evet | Satınalma tarafından doldurulur |
| Açıklamalar | OPRQ.Comments | comments | Hayır | Hayır | Uzun notlar için metin alanı |

## 📦 SATIR ALANLARI (PRQ1 Tablosu)

| Web Alanı Adı | SAP Alanı | Database Alanı | Zorunlu | Salt Okunur | İş Kuralları |
|--------------|-----------|----------------|---------|-------------|--------------|
| Departman | PRQ1.OcrCode | ocr_code | Evet | Hayır | Departman listesinden seçilir (Konsol, Bakır, vb.) |
| Kalem Kodu | OITM.ItemCode | item_code | Evet | Evet | Listeden seçilir, kalem tanımı ile birlikte gelir |
| Kalem Tanımı | OITM.ItemName | item_name | Evet | Evet | Kalem kodu seçilince otomatik doldurulur |
| Gerekli Tarih | PRQ1.PQTRegdate | pqt_regdate | Evet | Hayır | Her satır için ayrı tarih |
| Miktar | PRQ1.Quantity | quantity | Evet | Hayır | Sayısal değer |
| Ölçü Birimi | PRQ1.UomCode | uom_code | Evet | Hayır | Listeden seçilir (AD, KG, LT, vb.) |
| Satıcı Kodu | PRQ1.VendorCode | vendor_code | Hayır | Evet | Satıcı listesinden seçilir |
| Satır Açıklama | PRQ1.FreeTxt | free_txt | Hayır | Hayır | Satıra özel notlar |
| Dummy Ürün | - | is_dummy | - | - | Sistem kullanımı için |

## 📎 EK DOSYA ALANLARI (ATC1 Tablosu)

| SAP Alanı | Database Alanı | Açıklama |
|-----------|----------------|----------|
| ATC1.AbsEntry | abs_entry | Ek dosya giriş numarası |
| ATC1.LineNum | line_num | Satır numarası |
| ATC1.SrcPath | src_path | Kaynak dosya yolu |
| ATC1.TrgtPath | trgt_path | Hedef dosya yolu |
| ATC1.FileName | file_name | Dosya adı |
| ATC1.FileExt | file_ext | Dosya uzantısı |
| ATC1.FileDate | file_date | Dosya tarihi |
| ATC1.UserSign | user_sign | Kullanıcı imzası |
| ATC1.Copied | copied | Kopyalandı mı? |
| ATC1.Override | override | Üzerine yazıldı mı? |
| ATC1.FreeText | free_text | Serbest metin |

## 📋 LİSTE KOLONLARI

| Web Kolon Adı | SAP Alanı | Database Alanı | Özellikler |
|--------------|-----------|----------------|------------|
| Doküman No | OPRQ.DocNum | doc_num | Sıralanabilir |
| Talep Özeti | OPRQ.U_TalepOzeti | u_talep_ozeti | Aranabilir |
| Talep Eden | OPRQ.Reqname | req_name | Aranabilir |
| Departman | PRQ1.OcrCode | ocr_code | Filtrelenebilir |
| Belge Tarihi | OPRQ.TaxDate | tax_date | Tarih formatı |
| Gerekli Tarih | OPRQ.Reqdate | req_date | Tarih formatı |
| Geçerlilik T. | OPRQ.DocDueDate | doc_due_date | Tarih formatı |
| Kayıt Tarihi | OPRQ.DocDate | doc_date | Tarih formatı |
| Acil Talep | OPRQ.U_AcilMi | u_acil_mi | Icon/Badge ile gösterilir |
| Talep Durumu | OPRQ.U_TalepDurum | status | Renkli badge ile gösterilir |
| Kalem Sayısı | - | item_count | Hesaplanır |

## 🔄 DURUM DEĞERLERİ

| Durum | Renk | Açıklama |
|-------|------|----------|
| Satınalma Talebi | Mavi | İlk durum |
| Satınalmada | Turuncu | Satınalma incelemesinde |
| Satınalma Onayı | Yeşil | Satınalma onayladı |
| Revize | Sarı | Revize edilmeli |
| Reddedildi | Kırmızı | Talep reddedildi |
| Tamamlandı | Yeşil Koyu | İşlem tamamlandı |

## 📍 DEPARTMAN LİSTESİ

- Konsol
- Bakır
- İzole
- Bakımhane
- Depo
- Yönetim
- Finans
- İnsan Kaynakları

## 📏 ÖLÇÜ BİRİMLERİ

- AD (Adet)
- KG (Kilogram)
- LT (Litre)
- M (Metre)
- M2 (Metrekare)
- M3 (Metreküp)
- KOLİ
- PAKET
- KUTU

## 🔐 KULLANICI ROLLERİ VE YETKİLER

### User (Talep Açan)
- Talep oluşturabilir
- Kendi taleplerini görüntüleyebilir
- Revize durumundaki taleplerini düzenleyebilir

### Purchaser (Satınalmacı)
- Tüm talepleri görüntüleyebilir
- Talepleri onaylayabilir/reddedebilir
- Revize isteğinde bulunabilir
- Satıcı atayabilir

### Admin (Yönetici)
- Tüm yetkilere sahip
- Kullanıcı yönetimi
- Sistem ayarları

## 🎯 İŞ KURALLARI

### 1. Otomatik Doldurma
- **Doküman No**: Sistem en son numaranın +1'ini atar
- **Talep Eden**: Giriş yapan kullanıcının adı
- **Belge Tarihi**: Bugünün tarihi (değiştirilebilir)
- **Kayıt Tarihi**: Sistem tarihi
- **Kalem Tanımı**: Kalem kodu seçilince otomatik

### 2. Gerekli Tarih Değişimi
- Başlıktaki "Gerekli Tarih" değiştirildiğinde kullanıcıya sor:
  - "Mevcut satırları güncellemek istiyor musunuz?"
  - Evet: Tüm satırlar güncellenir
  - Hayır: Sadece yeni satırlar bu tarihi alır

### 3. Validasyon Kuralları
- **Doküman No**: Benzersiz olmalı
- **Miktar**: Sayısal ve > 0 olmalı
- **Tarihler**: DD/MM/YYYY formatında
- **Gerekli Tarih**: Belge Tarihinden ileri olmalı
- **En az 1 satır**: Talebin en az 1 kalemi olmalı

### 4. Talep Akışı
```
Talep Oluştur → Satınalma Talebi
                      ↓
              Satınalma İncelemesi → Satınalmada
                      ↓
         ┌────────────┴────────────┐
         ↓                         ↓
    Satınalma Onayı          Revize/Red
         ↓                         ↓
    Tamamlandı              Talep Açana Dön
```

## 📝 NOTLAR

- Tüm tarihler SAP formatında (DD/MM/YYYY) saklanır
- Boolean değerler 1/0 olarak saklanır
- Dummy ürünler özel iş kurallarına tabidir
- Ek dosyalar sunucuda fiziksel olarak saklanır
- Satıcı kodu salt okunurdur (sadece seçim ile değişir)

---

**Son Güncelleme:** 2025-10-16  
**Profesör de.** 👨‍🏫

