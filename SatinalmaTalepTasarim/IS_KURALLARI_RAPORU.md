# İş Kuralları Uygulama Raporu

## 📋 UYGULANAN İŞ KURALLARI

### 1️⃣ Otomatik Doldurma Kuralları

#### ✅ Doküman Numarası (DocNum)
- **Kural:** Sistem tarafından otomatik atanır
- **Uygulama:** API'den `getNextDocNumber()` ile alınıyor
- **Durum:** Otomatik, kullanıcı değiştiremez (read-only)
- **Kod Yeri:** `task-form.tsx` - useEffect içinde

```typescript
requestsAPI.getNextDocNumber()
  .then(response => {
    setDocNum(response.nextDocNumber)
  })
```

#### ✅ Talep Eden (Reqname)
- **Kural:** Giriş yapan kullanıcının adı otomatik doldurulur
- **Uygulama:** `currentUser?.name` değeri kullanılıyor
- **Durum:** Otomatik, kullanıcı değiştiremez (read-only)
- **Kod Yeri:** `task-form.tsx` - JSX input alanı

#### ✅ Belge Tarihi (TaxDate)
- **Kural:** Varsayılan olarak bugünün tarihi
- **Uygulama:** State initialization sırasında `new Date()` ile set ediliyor
- **Durum:** Varsayılan değer var, kullanıcı değiştirebilir
- **Kod Yeri:** `task-form.tsx` - useState initialization

```typescript
const [taxDate, setTaxDate] = useState(() => {
  const today = new Date()
  return `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
})
```

#### ✅ Kayıt Tarihi (DocDate)
- **Kural:** Sistem tarafından otomatik atanır
- **Uygulama:** Backend'de `CURRENT_TIMESTAMP` ile
- **Durum:** Otomatik (backend)
- **Kod Yeri:** `server/database/db.js` - CREATE TABLE

#### ✅ Kalem Tanımı (ItemName)
- **Kural:** Kalem Kodu seçilince otomatik doldurulur
- **Uygulama:** ItemSelectionDialog callback'inde
- **Durum:** Otomatik, kullanıcı değiştiremez (read-only)
- **Kod Yeri:** `task-form.tsx` - ItemSelectionDialog onItemSelected

```typescript
onItemSelected={(item) => {
  setTableRows(currentRows =>
    currentRows.map(row =>
      row.id === selectedRowId
        ? { ...row, ItemCode: item.itemCode, ItemName: item.itemName }
        : row
    )
  )
}}
```

### 2️⃣ Gerekli Tarih Değişim Kuralı

#### ✅ Başlık Gerekli Tarih Değişimi
- **Kural:** Başlıktaki "Gerekli Tarih" (Reqdate) değiştirildiğinde, mevcut satırlarda dolu tarih varsa kullanıcıya sorulur
- **Uygulama:** useEffect ile izleniyor
- **Aksiyon:** 
  - Evet → Tüm satırlar güncellenir
  - Hayır → Sadece yeni satırlar bu tarihi alır
- **Kod Yeri:** `task-form.tsx` - useEffect

```typescript
useEffect(() => {
  if (reqdate && rowsWithDate.length > 0) {
    const shouldUpdate = window.confirm(
      "Mevcut tablo satırlarını gerekli yeni tarih ile güncellemek istiyor musunuz?"
    )
    if (shouldUpdate) {
      return currentRows.map(row => ({ ...row, PQTRegdate: reqdate }))
    }
  }
}, [reqdate])
```

### 3️⃣ Validasyon Kuralları

#### ✅ Zorunlu Alanlar (OPRQ Header)
- DocNum ✓
- TaxDate ✓
- Reqdate ✓
- DocDueDate ✓
- Reqname ✓
- U_TalepOzeti ✓

#### ✅ Zorunlu Alanlar (PRQ1 Lines)
- ItemCode ✓
- ItemName ✓
- PQTRegdate ✓
- Quantity ✓
- UomCode ✓
- OcrCode (Departman) ✓

#### ✅ Miktar Validasyonu
- **Kural:** Miktar > 0 olmalı
- **Uygulama:** `validateForm()` içinde
- **Hata Mesajı:** "X. satır: Miktar 0'dan büyük bir sayı olmalıdır"

```typescript
const quantity = parseFloat(row.Quantity)
if (isNaN(quantity) || quantity <= 0) {
  errors.push(`${index + 1}. satır: Miktar 0'dan büyük bir sayı olmalıdır`)
}
```

#### ✅ Tarih Validasyonu
- **Kural:** Gerekli Tarih > Belge Tarihi
- **Uygulama:** `validateForm()` içinde tarih parse ve karşılaştırma
- **Hata Mesajı:** "Gerekli Tarih, Belge Tarihinden ileri bir tarih olmalıdır"

```typescript
const belgeDate = parseTaxDate(taxDate)
const gerekliDate = parseTaxDate(reqdate)

if (gerekliDate <= belgeDate) {
  errors.push("Gerekli Tarih, Belge Tarihinden ileri bir tarih olmalıdır")
}
```

#### ✅ Tarih Format Kontrolü
- **Format:** DD/MM/YYYY
- **Uygulama:** SAPDateInput component kullanımı ve parse kontrolü
- **Hata Mesajı:** "Tarih formatı hatalı (DD/MM/YYYY formatında olmalı)"

#### ✅ Minimum Satır Sayısı
- **Kural:** En az 1 kalem satırı olmalı
- **Uygulama:** `validateForm()` içinde `tableRows.length` kontrolü
- **Hata Mesajı:** "En az 1 kalem satırı eklemelisiniz"

#### ✅ Benzersizlik Kontrolü (Backend)
- **Kural:** DocNum benzersiz olmalı
- **Uygulama:** Database `UNIQUE` constraint
- **Kod Yeri:** `server/database/db.js`

```sql
DocNum TEXT NOT NULL UNIQUE
```

### 4️⃣ Talep Akışı

```
Talep Oluştur → Satınalma Talebi (U_TalepDurum)
                      ↓
              Satınalma İncelemesi → Satınalmacıda
                      ↓
         ┌────────────┴────────────┐
         ↓                         ↓
    Satınalma Onayı          Revize/Red
         ↓                         ↓
    Tamamlandı              Talep Açana Dön
```

### 5️⃣ Kullanıcı Rol Bazlı Erişim

#### User (Talep Açan)
- ✓ Talep oluşturabilir
- ✓ Kendi taleplerini görüntüleyebilir
- ✓ Revize durumundaki taleplerini düzenleyebilir

#### Purchaser (Satınalmacı)
- ✓ Tüm talepleri görüntüleyebilir
- ✓ Talepleri onaylayabilir/reddedebilir
- ✓ Revize isteğinde bulunabilir
- ✓ Satıcı atayabilir

#### Admin (Yönetici)
- ✓ Tüm yetkilere sahip
- ✓ Kullanıcı yönetimi
- ✓ Sistem ayarları

## 📊 UYGULAMA DETAYLARI

### Frontend Validation
**Dosya:** `src/components/task-form.tsx`
**Fonksiyon:** `validateForm()`
**Çalışma:** Form submit öncesi tüm kurallar kontrol edilir

### Backend Validation
**Dosya:** `server/routes/requests.js`
**Endpoint:** `POST /api/requests`
**Çalışma:** Database constraint'ler ve iş kuralları

### Database Constraints
**Dosya:** `server/database/db.js`
**Kurallar:**
- NOT NULL constraints
- UNIQUE constraints  
- CHECK constraints (role, status)
- FOREIGN KEY constraints (CASCADE)
- DEFAULT values

## ✅ TEST SENARYOLARI

### ✓ Senaryo 1: Pozitif Test - Normal Talep Oluşturma
1. Tüm zorunlu alanlar dolu
2. Miktar > 0
3. Gerekli Tarih > Belge Tarihi
4. En az 1 satır var
**Sonuç:** ✅ Başarılı

### ✓ Senaryo 2: Negatif Test - Miktar = 0
1. Miktar alanına 0 girilir
**Sonuç:** ❌ "Miktar 0'dan büyük bir sayı olmalıdır" hatası

### ✓ Senaryo 3: Negatif Test - Gerekli Tarih < Belge Tarihi
1. Gerekli Tarih geçmiş bir tarih seçilir
**Sonuç:** ❌ "Gerekli Tarih, Belge Tarihinden ileri bir tarih olmalıdır" hatası

### ✓ Senaryo 4: Negatif Test - Boş Satırlar
1. Hiç satır eklenmeden submit
**Sonuç:** ❌ "En az 1 kalem satırı eklemelisiniz" hatası

### ✓ Senaryo 5: Pozitif Test - Başlık Tarih Değişimi
1. Gerekli Tarih değiştirilir
2. Mevcut satırlarda tarih var
3. "Evet" seçilir
**Sonuç:** ✅ Tüm satır tarihleri güncellenir

### ✓ Senaryo 6: Pozitif Test - Otomatik Doldurma
1. Form açılır
2. DocNum otomatik gelir
3. Belge Tarihi bugün gelir
4. Talep Eden kullanıcı adı gelir
**Sonuç:** ✅ Tüm otomatik alanlar dolu

## 📝 NOTLAR

- Tüm tarihler SAP formatında (DD/MM/YYYY) saklanır
- Boolean değerler 1/0 olarak saklanır (U_AcilMi)
- Dummy ürünler özel iş kurallarına tabidir (isDummy flag)
- Ek dosyalar sunucuda fiziksel olarak saklanır (ATC1)
- Satıcı kodu salt okunurdur (sadece seçim ile değişir)
- Backend API SAP B1 formatında veri döner

---

**Son Güncelleme:** 2025-10-16  
**Versiyon:** 1.0.0  
**Profesör de.** 👨‍🏫

