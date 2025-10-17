# Talep Listesi Ekranı Dokümantasyonu

## İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [State Alanları](#state-alanları)
3. [Type Tanımlamaları](#type-tanımlamaları)
4. [Fonksiyonlar](#fonksiyonlar)
5. [API Entegrasyonu](#api-entegrasyonu)
6. [Filtre Sistemi](#filtre-sistemi)
7. [Sayfalama](#sayfalama)
8. [Excel Export](#excel-export)
9. [Modal Yapıları](#modal-yapıları)

---

## Genel Bakış

Talep Listesi ekranı, satınalma taleplerinin listelenmesi, filtrelenmesi, detaylarının görüntülenmesi ve yönetilmesi için kullanılan ana ekrandır. SAP Business One OPRQ (Purchase Request Header) ve PRQ1 (Purchase Request Line Items) tablolarına uygun veri yapısı kullanır.

**Dosya Konumu:** `src/pages/TalepListesi.tsx`

**Temel Özellikler:**
- Talepleri listeleme ve filtreleme
- Detaylı görünüm modalı
- Excel'e export (liste ve detay)
- Reddetme ve revize işlemleri
- Sayfalama sistemi
- Rol bazlı erişim kontrolü

---

## State Alanları

### 1. Kullanıcı ve UI State'leri

| State Adı | Tip | Başlangıç Değeri | Kullanım Amacı |
|-----------|-----|------------------|----------------|
| `currentUser` | `any` | `null` | Giriş yapmış kullanıcının bilgilerini tutar (id, name, role) |
| `isSidebarOpen` | `boolean` | `true` | Sidebar'ın açık/kapalı durumunu kontrol eder |
| `searchQuery` | `string` | `""` | Genel arama kutusundaki değeri tutar (DocNum, Reqname, U_TalepOzeti, OcrCode) |

### 2. Veri State'leri

| State Adı | Tip | Başlangıç Değeri | Kullanım Amacı |
|-----------|-----|------------------|----------------|
| `requests` | `PurchaseRequest[]` | `[]` | Backend'den gelen tüm satınalma taleplerini tutar |
| `selectedRequest` | `PurchaseRequest \| null` | `null` | Detay modalında gösterilecek seçili talebi tutar |

### 3. Modal State'leri

| State Adı | Tip | Başlangıç Değeri | Kullanım Amacı |
|-----------|-----|------------------|----------------|
| `isDetailDialogOpen` | `boolean` | `false` | Talep detay modalının açık/kapalı durumu |
| `isRejectDialogOpen` | `boolean` | `false` | Reddetme modalının açık/kapalı durumu |
| `isReviseDialogOpen` | `boolean` | `false` | Revize modalının açık/kapalı durumu |
| `rejectReason` | `string` | `""` | Reddetme sebebi text alanı |
| `reviseReason` | `string` | `""` | Revize sebebi text alanı |

### 4. Filtre ve Sayfalama State'leri

| State Adı | Tip | Başlangıç Değeri | Kullanım Amacı |
|-----------|-----|------------------|----------------|
| `filters` | `object` | `{DocNum: "", ...}` | Tüm tablo kolonları için filtre değerlerini tutar |
| `currentPage` | `number` | `1` | Sayfalama için aktif sayfa numarası |
| `itemsPerPage` | `number` | `20` | Sayfada gösterilecek kayıt sayısı (10, 20, 50, 100) |

#### filters Object Yapısı

```typescript
{
  DocNum: string,           // OPRQ.DocNum
  U_TalepOzeti: string,     // OPRQ.U_TalepOzeti
  Reqname: string,          // OPRQ.Reqname
  OcrCode: string,          // PRQ1.OcrCode (items içinden)
  TaxDate: string,          // OPRQ.TaxDate (YYYY-MM-DD)
  Reqdate: string,          // OPRQ.Reqdate (YYYY-MM-DD)
  DocDueDate: string,       // OPRQ.DocDueDate (YYYY-MM-DD)
  DocDate: string,          // OPRQ.DocDate (DD/MM/YYYY)
  U_TalepDurum: string      // OPRQ.U_TalepDurum (RequestStatus)
}
```

---

## Type Tanımlamaları

### 1. RequestStatus Type

Talebin iş akışındaki durumunu tanımlar.

```typescript
type RequestStatus =
  | "Satınalmacıda"          // Satınalma departmanında bekliyor
  | "Revize İstendi"         // Değişiklik talep edildi
  | "Reddedildi"             // Talep reddedildi
  | "Satınalma Teklifi"      // RFQ (Request for Quotation) aşaması
  | "Satınalma Talebi"       // PR (Purchase Request) oluşturuldu
  | "Satınalma Siparişi"     // PO (Purchase Order) oluşturuldu
  | "Mal Girişi"             // GRPO (Goods Receipt PO)
  | "Satıcı Faturası"        // AP Invoice
  | "Ödeme Yapıldı"          // Outgoing Payment
  | "İade"                   // Return
  | "Tamamlandı"             // Completed
```

### 2. RequestItem Type (SAP PRQ1)

Satınalma talebinin kalem detaylarını temsil eder.

```typescript
type RequestItem = {
  id: number,                    // Unique ID
  OcrCode: string,               // PRQ1.OcrCode - Departman/Maliyet Merkezi
  ItemCode: string,              // OITM.ItemCode - Stok Kodu
  ItemName: string,              // OITM.ItemName - Stok Tanımı
  PQTRegdate: string,            // PRQ1.PQTRegdate - Kalem Gerekli Tarih
  Quantity: string,              // PRQ1.Quantity - Miktar
  UomCode: string,               // PRQ1.UomCode - Birim (kg, adet, m3, vb.)
  VendorCode: string,            // PRQ1.VendorCode - Tercih edilen satıcı
  FreeTxt: string,               // PRQ1.FreeTxt - Kalem açıklaması
  file: File | null,             // Ek dosya (File objesi)
  fileData?: {                   // Veya backend'den gelen dosya datası
    name: string,
    content: string,
    type: string
  },
  isDummy?: boolean              // Dummy kalem işareti
}
```

### 3. PurchaseRequest Type (SAP OPRQ)

Satınalma talebinin ana bilgilerini temsil eder.

```typescript
type PurchaseRequest = {
  id: number,                    // Unique ID
  DocNum: string,                // OPRQ.DocNum - Doküman Numarası
  TaxDate?: string,              // OPRQ.TaxDate - Belge Tarihi
  Reqdate?: string,              // OPRQ.Reqdate - Gerekli Tarih
  DocDueDate?: string,           // OPRQ.DocDueDate - Geçerlilik Tarihi
  DocDate: string,               // OPRQ.DocDate - Kayıt Tarihi
  Reqname: string,               // OPRQ.Reqname - Talep Eden
  U_TalepDurum: RequestStatus,   // OPRQ.U_TalepDurum - Durum
  U_AcilMi?: boolean,            // OPRQ.U_AcilMi - Acil Talep İşareti
  U_TalepOzeti?: string,         // OPRQ.U_TalepOzeti - Talep Özeti
  Comments?: string,             // OPRQ.Comments - Açıklamalar
  U_RedNedeni?: string,          // Red nedeni (user defined field)
  U_RevizeNedeni?: string,       // Revize nedeni (user defined field)
  itemCount: number,             // Kalem sayısı
  items?: RequestItem[],         // Kalem listesi
  createdAt?: string,            // Oluşturulma tarihi (backend)
  updatedAt?: string             // Güncellenme tarihi (backend)
}
```

### 4. statusColors Object

Her durum için Tailwind CSS renk sınıflarını tanımlar.

```typescript
const statusColors: Record<RequestStatus, string> = {
  "Satınalmacıda": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Revize İstendi": "bg-orange-100 text-orange-800 border-orange-300",
  "Reddedildi": "bg-red-100 text-red-800 border-red-300",
  "Satınalma Teklifi": "bg-blue-100 text-blue-800 border-blue-300",
  "Satınalma Talebi": "bg-indigo-100 text-indigo-800 border-indigo-300",
  "Satınalma Siparişi": "bg-cyan-100 text-cyan-800 border-cyan-300",
  "Mal Girişi": "bg-teal-100 text-teal-800 border-teal-300",
  "Satıcı Faturası": "bg-purple-100 text-purple-800 border-purple-300",
  "Ödeme Yapıldı": "bg-emerald-100 text-emerald-800 border-emerald-300",
  "İade": "bg-rose-100 text-rose-800 border-rose-300",
  "Tamamlandı": "bg-green-100 text-green-800 border-green-300",
}
```

---

## Fonksiyonlar

### 1. Utility Fonksiyonlar

#### `formatDate(dateStr: string | undefined): string`

**Amaç:** Tarih formatını YYYY-MM-DD veya DD.MM.YYYY'den DD/MM/YYYY'ye çevirir.

**Parametreler:**
- `dateStr`: Formatlanacak tarih string'i

**Dönüş:** DD/MM/YYYY formatında string veya "-"

**Örnek:**
```typescript
formatDate("2024-01-15")     // "15/01/2024"
formatDate("15.01.2024")     // "15/01/2024"
formatDate(undefined)        // "-"
```

**Mantık:**
1. dateStr yoksa "-" döner
2. "." içeriyorsa (DD.MM.YYYY), "/" ile değiştirir
3. "-" içeriyorsa (YYYY-MM-DD), split edip DD/MM/YYYY'ye çevirir

---

### 2. Data Fetching Fonksiyonlar

#### `fetchCurrentUser()`

**Amaç:** localStorage'dan userId'yi alıp backend'den kullanıcı bilgilerini çeker.

**useEffect ile çalışır:** Sayfa yüklendiğinde otomatik çalışır

**İş Akışı:**
```
1. localStorage'dan userId oku
2. userId yoksa → /login'e yönlendir
3. GET /api/auth/me/${userId}
4. Response başarılıysa → setCurrentUser()
5. fetchRequestsFromBackend() çağır
6. Hata varsa → localStorage temizle, /login'e yönlendir
```

**Kod Satırı:** 159-178

---

#### `fetchRequestsFromBackend(user: any)`

**Amaç:** Backend API'den talepleri çeker, SAP formatına uygun şekilde parse eder ve state'e yazar.

**Parametreler:**
- `user`: Kullanıcı objesi (id, role)

**İş Akışı:**
```
1. GET /api/requests?userId=${user.id}&userRole=${user.role}
2. Response'u PurchaseRequest[] formatına map et
3. setRequests() ile state'e yaz
4. localStorage'a backup kaydet
5. Hata durumunda localStorage'dan yükle
```

**Mapping İşlemi:**
```typescript
const formattedRequests: PurchaseRequest[] = data.map((req: any) => ({
  id: req.id,
  DocNum: req.DocNum,
  TaxDate: req.TaxDate,
  // ... tüm OPRQ alanları
  U_TalepDurum: (req.U_TalepDurum || req.status) as RequestStatus,
  items: req.items?.map((item: any) => ({
    id: item.id,
    OcrCode: item.OcrCode,
    // ... tüm PRQ1 alanları
  })) || []
}))
```

**Kod Satırı:** 182-234

---

### 3. Filtreleme ve Sayfalama

#### `filteredRequests` (useMemo)

**Amaç:** searchQuery ve filters'a göre talepleri filtreler.

**Bağımlılıklar:** `[requests, searchQuery, filters]`

**Filtreleme Mantığı:**
```typescript
1. searchMatch kontrolü (OR):
   - DocNum içinde ara
   - Reqname içinde ara
   - U_TalepOzeti içinde ara
   - items[].OcrCode içinde ara

2. Her filtre için AND kontrolü:
   - filters.DocNum
   - filters.U_TalepOzeti
   - filters.Reqname
   - filters.OcrCode (items içinde any kontrolü)
   - filters.TaxDate (exact match)
   - filters.Reqdate (exact match)
   - filters.DocDueDate (exact match)
   - filters.DocDate (includes kontrolü)
   - filters.U_TalepDurum (exact match)
```

**Kod Satırı:** 236-258

---

#### `paginatedRequests` (useMemo)

**Amaç:** Filtrelenmiş taleplere sayfalama uygular.

**Bağımlılıklar:** `[filteredRequests, startIndex, endIndex]`

**Hesaplama:**
```typescript
totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
startIndex = (currentPage - 1) * itemsPerPage
endIndex = startIndex + itemsPerPage
paginatedRequests = filteredRequests.slice(startIndex, endIndex)
```

**Kod Satırı:** 260-266

---

### 4. Aksiyon Fonksiyonlar

#### `handleLogout()`

**Amaç:** Kullanıcıyı çıkış yaptırıp login sayfasına yönlendirir.

**İşlem:**
```typescript
localStorage.removeItem("userId")
localStorage.removeItem("userRole")
navigate("/login")
```

**Kod Satırı:** 273-277

---

#### `handleViewDetails(request: PurchaseRequest)`

**Amaç:** Seçili talebi state'e atar ve detay modalını açar.

**Parametreler:**
- `request`: Görüntülenecek talep

**İşlem:**
```typescript
setSelectedRequest(request)
setIsDetailDialogOpen(true)
```

**Kod Satırı:** 279-282

---

#### `handleRejectClick()`

**Amaç:** Reddetme modalını açar.

**Kullanıcı Rolü:** purchaser veya admin

**İşlem:**
```typescript
setIsRejectDialogOpen(true)
```

**Kod Satırı:** 285-287

---

#### `handleRejectConfirm()`

**Amaç:** Talebi "Reddedildi" durumuna getirir ve backend'e PUT request gönderir.

**Validasyon:** rejectReason boş olamaz

**İş Akışı:**
```
1. Validasyon kontrolü (rejectReason trim)
2. PUT /api/requests/${selectedRequest.id}
   Body: {
     ...selectedRequest,
     U_TalepDurum: "Reddedildi",
     U_RedNedeni: (eskiNeden) + "\n\nRed Sebebi: " + rejectReason
   }
3. Response başarılıysa:
   - fetchRequestsFromBackend() çağır
   - Alert göster
   - Modalları kapat
4. Hata durumunda console.error ve alert
```

**Kod Satırı:** 289-326

---

#### `handleReviseClick()`

**Amaç:** Revize modalını açar.

**Kullanıcı Rolü:** purchaser veya admin

**İşlem:**
```typescript
setIsReviseDialogOpen(true)
```

**Kod Satırı:** 328-330

---

#### `handleReviseConfirm()`

**Amaç:** Talebi "Revize İstendi" durumuna getirir ve backend'e PUT request gönderir.

**Validasyon:** reviseReason boş olamaz

**İş Akışı:**
```
1. Validasyon kontrolü (reviseReason trim)
2. PUT /api/requests/${selectedRequest.id}
   Body: {
     ...selectedRequest,
     U_TalepDurum: "Revize İstendi",
     U_RevizeNedeni: (eskiNeden) + "\n\nRevize Notu: " + reviseReason
   }
3. Response başarılıysa:
   - fetchRequestsFromBackend() çağır
   - Alert göster
   - Modalları kapat
4. Hata durumunda console.error ve alert
```

**Kod Satırı:** 332-369

---

#### `handleEditAndResubmit()`

**Amaç:** Revize edilen talebi düzenlemek için ana form sayfasına yönlendirir.

**Kullanıcı Rolü:** user (talep sahibi)

**Durum Kontrolü:** U_TalepDurum === "Revize İstendi" && Reqname === currentUser.name

**İşlem:**
```typescript
navigate("/", { state: { editingRequest: selectedRequest } })
```

**Not:** Ana form sayfası (Talep Oluşturma) location.state'den editingRequest'i okur ve formu doldurur.

**Kod Satırı:** 371-376

---

### 5. Excel Export Fonksiyonlar

#### `handleExportToExcel()`

**Amaç:** Filtrelenmiş talep listesinin tamamını stilize edilmiş Excel dosyasına export eder.

**Kütüphane:** ExcelJS

**Excel Yapısı:**
```
Başlık Satırı (Turuncu, Bold):
- Doküman No
- Talep Özeti
- Talep Eden
- Belge Tarihi
- Gerekli Tarih
- Geçerlilik Tarihi
- Kayıt Tarihi
- Acil
- Durum

Veri Satırları (Zebra Pattern):
- Çift satırlar: #F9FAFB
- Tek satırlar: #FFFFFF
- Border: Thin, #E5E7EB
```

**Stil Özellikleri:**
- Başlık: Turuncu bg (#FFED7C1E), Beyaz text, Bold
- Hücreler: Orta hizalı (Talep Özeti hariç - sola hizalı)
- Satır yüksekliği: 20px
- Kolon genişlikleri: Auto-fit

**Dosya Adı:** `Satinalma_Talep_Listesi_DD.MM.YYYY.xlsx`

**Kod Satırı:** 378-477

---

#### `handleExportDetailToExcel(request: PurchaseRequest)`

**Amaç:** Seçili talebin detayını iki bölümlü Excel dosyasına export eder.

**Parametreler:**
- `request`: Export edilecek talep

**Excel Yapısı:**

**BÖLÜM 1 - Genel Bilgiler (Turuncu Başlık):**
```
Satır 1 (Turuncu): Doküman No | Talep Özeti | Talep Eden | Belge Tarihi | ...
Satır 2 (Beyaz): Değerler
Satır 3: Boş satır
```

**BÖLÜM 2 - Kalem Detayları (Mavi Başlık):**
```
Satır 4 (Mavi): Satır No | Kalem Kodu | Kalem Tanımı | Departman | ...
Satır 5+: Kalem verileri (Zebra pattern)
```

**Stil Özellikleri:**
- Turuncu başlık: #FFED7C1E
- Mavi başlık: #FF3B82F6
- Zebra pattern: #FFF9FAFB / #FFFFFFFF
- Text wrap: Açıklamalar, Revize/Red Nedeni kolonları

**Kolon Genişlikleri:**
```typescript
Satır No: 10
Kalem Kodu: 20
Kalem Tanımı: 30
Departman: 15
Miktar: 10
Birim: 10
Satıcı: 20
Gerekli Tarih: 18
Açıklama: 35
Ek Dosya: 20
```

**Dosya Adı:** `Talep_{DocNum}_Detay.xlsx`

**Kod Satırı:** 479-680

---

## API Entegrasyonu

### 1. Authentication API

#### GET `/api/auth/me/${userId}`

**Amaç:** Kullanıcı bilgilerini getirir

**Request:**
```typescript
fetch(`http://localhost:3001/api/auth/me/${userId}`)
```

**Response:**
```typescript
{
  id: number,
  name: string,
  email: string,
  role: "user" | "purchaser" | "admin"
}
```

**Kullanım:** useEffect - Sayfa yüklendiğinde

**Hata Durumu:**
- localStorage temizle
- /login'e yönlendir

---

### 2. Requests API

#### GET `/api/requests?userId=${userId}&userRole=${role}`

**Amaç:** Kullanıcıya özel talep listesini getirir

**Query Parameters:**
- `userId`: Kullanıcı ID
- `userRole`: Kullanıcı rolü (user, purchaser, admin)

**Backend Filtreleme Mantığı:**
```typescript
if (userRole === "user") {
  // Sadece kendi talepleri
  requests = requests.filter(r => r.createdBy === userId)
} else if (userRole === "purchaser" || userRole === "admin") {
  // Tüm talepler
  requests = requests
}
```

**Response:**
```typescript
[
  {
    id: number,
    DocNum: string,
    // ... tüm OPRQ alanları
    items: [
      {
        id: number,
        OcrCode: string,
        // ... tüm PRQ1 alanları
      }
    ]
  }
]
```

**Kullanım:** fetchRequestsFromBackend()

**Hata Durumu:** localStorage'dan yükle

---

#### PUT `/api/requests/${id}`

**Amaç:** Talep durumunu günceller (Reddet/Revize)

**Request:**
```typescript
fetch(`http://localhost:3001/api/requests/${selectedRequest.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    ...selectedRequest,
    U_TalepDurum: "Reddedildi", // veya "Revize İstendi"
    U_RedNedeni: "...",         // veya U_RevizeNedeni
  }),
})
```

**Response:**
```typescript
{
  success: boolean,
  message: string,
  data: PurchaseRequest
}
```

**Kullanım:**
- handleRejectConfirm()
- handleReviseConfirm()

**Hata Durumu:** console.error + alert

---

## Filtre Sistemi

### Filtre Bileşenleri

Tablonun üst kısmında her kolon için ayrı filtre input'u bulunur.

#### 1. Text Input Filtreleri

**Kolonlar:**
- DocNum (Doküman No)
- U_TalepOzeti (Talep Özeti)
- Reqname (Talep Eden)

**Filtreleme Türü:** includes (case-insensitive)

**Kod:**
```typescript
<Input
  placeholder="Filtrele..."
  className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
  value={filters.DocNum}
  onChange={(e) => setFilters({ ...filters, DocNum: e.target.value })}
/>
```

---

#### 2. Date Input Filtreleri

**Kolonlar:**
- TaxDate (Belge Tarihi)
- Reqdate (Gerekli Tarih)
- DocDueDate (Geçerlilik Tarihi)

**Filtreleme Türü:** exact match (YYYY-MM-DD)

**Özel Özellik:** showPicker() ile tıklandığında otomatik takvim açma

**Kod:**
```typescript
<Input
  type="date"
  className="h-7 text-[10px] bg-white border-gray-200 px-1 w-full cursor-pointer"
  value={filters.TaxDate}
  onChange={(e) => setFilters({ ...filters, TaxDate: e.target.value })}
  onClick={(e) => {
    const input = e.currentTarget as HTMLInputElement
    if ('showPicker' in input && typeof input.showPicker === 'function') {
      try { input.showPicker() } catch (error) { console.warn('showPicker failed:', error) }
    }
  }}
/>
```

---

#### 3. Select Dropdown Filtresi

**Kolon:** U_TalepDurum (Durum)

**Filtreleme Türü:** exact match

**Seçenekler:**
```typescript
<option value="">Tümü</option>
<option value="Satınalmacıda">Satınalmacıda</option>
<option value="Revize İstendi">Revize</option>
<option value="Reddedildi">Reddedildi</option>
<option value="Satınalma Teklifi">Teklif</option>
<option value="Satınalma Talebi">Talep</option>
<option value="Satınalma Siparişi">Sipariş</option>
<option value="Mal Girişi">Mal Girişi</option>
<option value="Satıcı Faturası">Fatura</option>
<option value="Ödeme Yapıldı">Ödendi</option>
<option value="İade">İade</option>
<option value="Tamamlandı">Tamamlandı</option>
```

---

#### 4. Filtreleri Temizle Butonu

**Konum:** Filtre satırının son kolonu

**Fonksiyon:**
```typescript
onClick={() => setFilters({
  DocNum: "",
  U_TalepOzeti: "",
  Reqname: "",
  OcrCode: "",
  TaxDate: "",
  Reqdate: "",
  DocDueDate: "",
  DocDate: "",
  U_TalepDurum: ""
})}
```

**İkon:** ✕

---

### Genel Arama (Search Query)

**Konum:** Tablo üstü, sol taraf

**Placeholder:** "Doküman numarası, talep eden veya departmana göre ara..."

**Arama Kapsamı:**
- DocNum (içinde arama)
- Reqname (içinde arama)
- U_TalepOzeti (içinde arama)
- items[].OcrCode (any - herhangi bir kalemde)

**Kod:**
```typescript
const searchMatch =
  request.DocNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
  request.Reqname.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (request.U_TalepOzeti && request.U_TalepOzeti.toLowerCase().includes(searchQuery.toLowerCase())) ||
  (request.items && request.items.some(item => item.OcrCode.toLowerCase().includes(searchQuery.toLowerCase())))
```

---

## Sayfalama

### Sayfalama State'leri

```typescript
const [currentPage, setCurrentPage] = useState(1)
const [itemsPerPage, setItemsPerPage] = useState(20)
```

### Hesaplamalar

```typescript
const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage
const paginatedRequests = filteredRequests.slice(startIndex, endIndex)
```

### UI Bileşenleri

#### 1. Sayfa Başına Kayıt Seçici

**Seçenekler:** 10, 20, 50, 100

**Kod:**
```typescript
<select
  value={itemsPerPage}
  onChange={(e) => {
    setItemsPerPage(Number(e.target.value))
    setCurrentPage(1)  // İlk sayfaya dön
  }}
>
  <option value={10}>10</option>
  <option value={20}>20</option>
  <option value={50}>50</option>
  <option value={100}>100</option>
</select>
```

---

#### 2. Sayfa Navigasyon Butonları

**Butonlar:**
- `««` - İlk sayfa
- `‹` - Önceki sayfa
- Sayfa numaraları (akıllı gösterim)
- `›` - Sonraki sayfa
- `»»` - Son sayfa

**Akıllı Sayfa Numarası Gösterimi:**
```
İlk 2 sayfa + Son 2 sayfa + Mevcut sayfa civarı (±1)

Örnek:
1 ... 5 6 [7] 8 9 ... 20
```

**Kod:**
```typescript
{Array.from({ length: totalPages }, (_, i) => i + 1)
  .filter(page => {
    return (
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
    )
  })
  .map((page, index, arr) => {
    const showEllipsis = index > 0 && page - arr[index - 1] > 1
    return (
      <div key={page}>
        {showEllipsis && <span>...</span>}
        <button onClick={() => setCurrentPage(page)}>
          {page}
        </button>
      </div>
    )
  })
}
```

---

#### 3. Sayfa Bilgisi

**Gösterilen Bilgiler:**
- Toplam talep sayısı
- Aktif sayfa / Toplam sayfa
- Gösterilen kayıt aralığı

**Örnek:** "Toplam 156 talep | Sayfa 3 / 8 | Gösterilen: 41-60"

---

### useEffect - Filtre Değişince İlk Sayfaya Dön

```typescript
useEffect(() => {
  setCurrentPage(1)
}, [searchQuery, filters])
```

---

## Excel Export

### 1. Liste Export (handleExportToExcel)

#### ExcelJS Workbook Yapısı

```typescript
const workbook = new ExcelJS.Workbook()
const worksheet = workbook.addWorksheet('Talep Listesi')
```

#### Kolon Tanımları

```typescript
worksheet.columns = [
  { header: 'Doküman No', key: 'DocNum', width: 15 },
  { header: 'Talep Özeti', key: 'U_TalepOzeti', width: 35 },
  { header: 'Talep Eden', key: 'Reqname', width: 20 },
  { header: 'Belge Tarihi', key: 'TaxDate', width: 15 },
  { header: 'Gerekli Tarih', key: 'Reqdate', width: 15 },
  { header: 'Geçerlilik Tarihi', key: 'DocDueDate', width: 15 },
  { header: 'Kayıt Tarihi', key: 'DocDate', width: 15 },
  { header: 'Acil', key: 'U_AcilMi', width: 10 },
  { header: 'Durum', key: 'U_TalepDurum', width: 20 },
]
```

#### Başlık Satırı Stili

```typescript
headerRow.height = 25
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFED7C1E' } // Turuncu
}
cell.font = {
  bold: true,
  color: { argb: 'FFFFFFFF' },
  size: 12
}
cell.alignment = {
  vertical: 'middle',
  horizontal: 'center'
}
cell.border = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
}
```

#### Veri Satırları Stili (Zebra Pattern)

```typescript
const isEvenRow = (index % 2) === 0
row.height = 20

cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF' }
}
cell.font = {
  size: 11,
  color: { argb: 'FF1F2937' }
}
cell.alignment = {
  vertical: 'middle',
  horizontal: colNumber === 2 ? 'left' : 'center'
}
cell.border = {
  top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
  right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
}
```

#### Dosya İndirme

```typescript
const today = new Date()
const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
const fileName = `Satinalma_Talep_Listesi_${dateStr}.xlsx`

const buffer = await workbook.xlsx.writeBuffer()
const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = fileName
a.click()
window.URL.revokeObjectURL(url)
```

---

### 2. Detay Export (handleExportDetailToExcel)

#### Bölüm 1: Genel Bilgiler (Turuncu Başlık)

**Satır 1 - Başlıklar:**
```typescript
const generalHeaders = [
  'Doküman No', 'Talep Özeti', 'Talep Eden', 'Belge Tarihi', 'Gerekli Tarih',
  'Geçerlilik Tarihi', 'Kayıt Tarihi', 'Acil', 'Durum',
  'Açıklamalar', 'Revize Nedeni', 'Red Nedeni'
]
```

**Stil:**
```typescript
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFED7C1E' } // Turuncu
}
```

**Satır 2 - Değerler:**
```typescript
const generalDataRow = worksheet.addRow([
  request.DocNum,
  request.U_TalepOzeti || "-",
  request.Reqname,
  formatDate(request.TaxDate),
  formatDate(request.Reqdate),
  request.DocDueDate ? formatDate(request.DocDueDate) : "-",
  formatDate(request.DocDate),
  request.U_AcilMi ? "Evet" : "Hayır",
  request.U_TalepDurum,
  request.Comments || "-",
  request.U_RevizeNedeni || "-",
  request.U_RedNedeni || "-"
])
```

**Satır 3 - Boş Satır**

---

#### Bölüm 2: Kalem Detayları (Mavi Başlık)

**Satır 4 - Başlıklar:**
```typescript
const itemHeaders = [
  'Satır No', 'Kalem Kodu', 'Kalem Tanımı', 'Departman',
  'Miktar', 'Birim', 'Satıcı', 'Kalem Gerekli Tarih', 'Kalem Açıklaması', 'Ek Dosya'
]
```

**Stil:**
```typescript
cell.fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF3B82F6' } // Mavi
}
```

**Satır 5+ - Kalem Verileri:**
```typescript
items.forEach((item: any, index: number) => {
  const itemRowData = [
    item.ItemCode ? index + 1 : "-",
    item.ItemCode || "-",
    item.ItemName || "-",
    item.OcrCode || "-",
    item.Quantity || "-",
    item.UomCode || "-",
    item.VendorCode || "-",
    item.PQTRegdate ? formatDate(item.PQTRegdate) : "-",
    item.FreeTxt || "-",
    (item.file || item.fileData) ? (item.file?.name || item.fileData?.name) : "-"
  ]

  const row = worksheet.addRow(itemRowData)
  // Zebra pattern stili uygula
})
```

---

## Modal Yapıları

### 1. Detay Modal (isDetailDialogOpen)

**Tetikleme:** handleViewDetails() veya satıra tıklama

**İçerik Bölümleri:**

#### Header
- Doküman No başlığı
- Excel'e Aktar butonu

#### Body (Scrollable)

**1. Talep Özeti Kartı (Varsa)**
- Turuncu sol border
- Gradient background
- 📝 emoji + başlık

**2. Durum ve Acil Badges**
- Status badge (renkli)
- Acil talep badge (kırmızı, varsa)

**3. Genel Bilgiler Grid (2 kolon)**
- Talep Eden kartı
- Aciliyet kartı

**4. Tarihler Kartı (4 kolon)**
- Belge Tarihi (gri)
- Gerekli Tarih (turuncu)
- Kayıt Tarihi (gri)
- Geçerlilik Tarihi (yeşil)

**5. Kalem Listesi Tablosu (Varsa)**
- Package emoji + başlık + kalem sayısı badge
- Turuncu border tablo
- Kolonlar: Kalem Kodu, Tanım, Departman, Miktar, Birim, Satıcı, Gerekli Tarih, Açıklama, Ek Dosya
- Ek dosya: İndirme butonu (📎 emoji)
- Dummy kalem işareti: 🔸

**6. Notlar Grid (3 kolon)**
- Açıklamalar (turuncu)
- Revize Nedeni (sarı)
- Red Nedeni (kırmızı)

#### Footer

**Purchaser/Admin + "Satınalmacıda" durumu:**
```
[Reddet] [Revize İste]
```

**User + "Revize İstendi" + Kendi talebi:**
```
[Düzenle ve Tekrar Gönder]
```

**Kod Satırı:** 1130-1398

---

### 2. Reddetme Modal (isRejectDialogOpen)

**Tetikleme:** handleRejectClick()

**İçerik:**

#### Header
- ❌ emoji + "Talebi Reddet" başlığı (kırmızı)

#### Body
- Kırmızı bilgi kartı (DocNum, Talep Eden)
- Textarea: Red sebebi (*zorunlu)

#### Footer
```
[İptal] [Reddet (disabled if empty)]
```

**Onay Fonksiyonu:** handleRejectConfirm()

**Kod Satırı:** 1400-1454

---

### 3. Revize Modal (isReviseDialogOpen)

**Tetikleme:** handleReviseClick()

**İçerik:**

#### Header
- 🔄 emoji + "Revize İste" başlığı (turuncu)

#### Body
- Turuncu bilgi kartı (DocNum, Talep Eden)
- Textarea: Revize sebebi (*zorunlu)

#### Footer
```
[İptal] [Revize İste (disabled if empty)]
```

**Onay Fonksiyonu:** handleReviseConfirm()

**Kod Satırı:** 1456-1510

---

## UI Bileşenleri ve Styling

### Header (Modern Zwilling Style)

**Yükseklik:** 56px (h-14)

**Sol Taraf:**
- Mobile hamburger menu butonu
- "Talep Listesi" başlığı
- Breadcrumb (lg+ ekranlarda)

**Sağ Taraf:**
- Bildirim butonu (nokta badge)
- Ayarlar butonu
- Kullanıcı avatar (gradient turuncu)
- Kullanıcı adı + rol
- Çıkış butonu

---

### Tablo Yapısı

**Grid System:**
```
grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_70px_130px_80px]
```

**Kolonlar:**
1. Doküman No (130px)
2. Talep Özeti (flex, min 180px)
3. Talep Eden (150px)
4. Belge Tarihi (120px)
5. Gerekli Tarih (120px)
6. Geçerlilik Tarihi (120px)
7. Kayıt Tarihi (120px)
8. Acil (70px, center)
9. Durum (130px)
10. İşlemler (80px, center)

**Sticky Positioning:**
- Filtre satırı: `sticky top-0 z-20`
- Başlık satırı: `sticky top-[40px] z-10`

**Scrollbar Styling:**
```css
.table-scroll::-webkit-scrollbar {
  height: 12px;
}
.table-scroll::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 6px;
}
.table-scroll::-webkit-scrollbar-thumb {
  background: #FF6B1A;
  border-radius: 6px;
}
```

---

### Renk Paleti

**Ana Renk (Turuncu):**
- Primary: `rgba(237, 124, 30)` / `#ED7C1E`
- Hover: `#FF8C42`
- Background: `rgba(237, 124, 30, 0.1)`
- Border: `rgba(237, 124, 30, 0.2)`

**Gradient:**
```css
linear-gradient(135deg, #FF6B1A 0%, #FF8C42 100%)
```

**Status Colors:** (statusColors object'e bakın)

---

## Rol Bazlı Erişim Kontrolü

### User (Talep Açan)

**Görüntüleme:**
- Sadece kendi talepleri

**Yetkiler:**
- Talep detayı görüntüleme
- Excel export (liste ve detay)
- "Revize İstendi" durumundaki kendi taleplerini düzenleme

**Yasak:**
- Başkasının taleplerini görüntüleme
- Reddetme/Revize isteme

---

### Purchaser (Satınalmacı)

**Görüntüleme:**
- Tüm talepler

**Yetkiler:**
- Talep detayı görüntüleme
- Excel export (liste ve detay)
- "Satınalmacıda" ve "Satınalma Talebi" durumundaki talepleri reddetme
- "Satınalmacıda" ve "Satınalma Talebi" durumundaki taleplerde revize isteme

**Yasak:**
- Kendi talebi oluşturma (gerekirse user rolü ile)

---

### Admin

**Görüntüleme:**
- Tüm talepler

**Yetkiler:**
- Purchaser'ın tüm yetkileri
- (İleride eklenebilir: Kullanıcı yönetimi, sistem ayarları, vb.)

---

## Performans Optimizasyonları

### useMemo Kullanımı

```typescript
// Filtrelenmiş liste (dependencies: requests, searchQuery, filters)
const filteredRequests = useMemo(() => { ... }, [requests, searchQuery, filters])

// Sayfalanmış liste (dependencies: filteredRequests, startIndex, endIndex)
const paginatedRequests = useMemo(() => { ... }, [filteredRequests, startIndex, endIndex])
```

**Amaç:** Gereksiz yeniden hesaplamaları önler

---

### localStorage Backup

```typescript
// Başarılı fetch sonrası kaydet
localStorage.setItem("purchaseRequests", JSON.stringify(formattedRequests))

// Backend hatası durumunda yükle
const savedRequests = localStorage.getItem("purchaseRequests")
if (savedRequests) {
  setRequests(JSON.parse(savedRequests))
}
```

**Amaç:** Offline çalışma, hata durumunda veri kaybını önleme

---

## Hata Yönetimi

### 1. Authentication Hatası

```typescript
try {
  const response = await fetch(`http://localhost:3001/api/auth/me/${userId}`)
  if (!response.ok) throw new Error('Kullanıcı bilgisi alınamadı')
  // ...
} catch (error) {
  console.error('User fetch error:', error)
  localStorage.removeItem("userId")
  localStorage.removeItem("userRole")
  navigate("/login")
}
```

---

### 2. Request Fetch Hatası

```typescript
try {
  const response = await fetch(`http://localhost:3001/api/requests?...`)
  // ...
} catch (error) {
  console.error('Backend API hatası:', error)

  // localStorage'dan yükle
  const savedRequests = localStorage.getItem("purchaseRequests")
  if (savedRequests) {
    setRequests(JSON.parse(savedRequests))
  }
}
```

---

### 3. Update Hatası (Reddet/Revize)

```typescript
try {
  const response = await fetch(`http://localhost:3001/api/requests/${id}`, {
    method: 'PUT',
    // ...
  })

  if (!response.ok) {
    throw new Error('Talep reddedilemedi')
  }

  alert("Talep reddedildi!")
} catch (error) {
  console.error('Reject error:', error)
  alert('Talep reddedilirken bir hata oluştu!')
}
```

---

## Gelecek Geliştirmeler

### Öneriler

1. **Sorting (Sıralama):**
   - Kolon başlıklarına tıklayınca ASC/DESC sıralama
   - Multi-column sorting

2. **Advanced Filters:**
   - Tarih aralığı seçimi (başlangıç-bitiş)
   - Departman multi-select
   - Acillik checkbox

3. **Bulk Actions:**
   - Çoklu seçim (checkbox)
   - Toplu reddetme/revize

4. **Real-time Updates:**
   - WebSocket entegrasyonu
   - Otomatik yenileme (polling)

5. **Export Options:**
   - PDF export
   - CSV export
   - Seçili satırları export

6. **Görünüm Ayarları:**
   - Kolon göster/gizle
   - Kolon sırası değiştirme
   - Kullanıcı tercihlerini kaydetme

7. **Mobile Optimization:**
   - Responsive tablo (kartlara dönüşme)
   - Swipe actions

8. **Accessibility:**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

---

## Bağımlılıklar

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "lucide-react": "^0.x",
  "xlsx": "^0.x",
  "exceljs": "^4.x",
  "@/components/ui/button": "shadcn/ui",
  "@/components/ui/input": "shadcn/ui",
  "@/components/ui/textarea": "shadcn/ui",
  "@/components/ui/dialog": "shadcn/ui",
  "@/components/ui/table": "shadcn/ui",
  "@/components/Sidebar": "custom"
}
```

---

## Lisans ve İletişim

**Proje:** SAP Satınalma Talep Yönetim Sistemi

**Geliştirici:** AIF Bilişim ve Danışmanlık

**Versiyon:** 1.0.0

**Son Güncelleme:** 2024

---

## Ek Notlar

### SAP Entegrasyon Hazırlığı

Bu ekran SAP Business One entegrasyonu için hazırlanmıştır:

**OPRQ Tablo Mapping:**
- DocNum → Doküman Numarası
- TaxDate → Belge Tarihi
- Reqdate → Gerekli Tarih
- DocDueDate → Geçerlilik Tarihi
- DocDate → Kayıt Tarihi
- Reqname → Talep Eden
- U_TalepDurum → User Defined Field (Durum)
- U_AcilMi → User Defined Field (Acil Mi?)
- U_TalepOzeti → User Defined Field (Talep Özeti)
- Comments → Açıklamalar
- U_RedNedeni → User Defined Field (Red Nedeni)
- U_RevizeNedeni → User Defined Field (Revize Nedeni)

**PRQ1 Tablo Mapping:**
- OcrCode → Departman/Maliyet Merkezi
- ItemCode → Stok Kodu (OITM.ItemCode)
- ItemName → Stok Tanımı (OITM.ItemName)
- PQTRegdate → Kalem Gerekli Tarih
- Quantity → Miktar
- UomCode → Birim
- VendorCode → Satıcı Kodu
- FreeTxt → Açıklama

---

**Dokümantasyon Sonu**
