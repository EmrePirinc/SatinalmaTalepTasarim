# SAP B1 API Response Format

## 📡 API RESPONSE YAPISI

### ✅ TAMAMEN SAP UYUMLU FORMAT

API response'lar **sadece SAP B1 alanlarını** içerir. Internal alanlar ayrı olarak işaretlenmiştir.

## 📊 GET /api/requests - Response Format

```json
{
  // ========== SAP OPRQ (Header) Fields ==========
  "id": 1,                                    // Internal: Database ID
  "DocNum": "1001",                           // ✓ OPRQ.DocNum
  "TaxDate": "16/10/2025",                    // ✓ OPRQ.TaxDate
  "Reqdate": "20/10/2025",                    // ✓ OPRQ.Reqdate
  "DocDueDate": "30/10/2025",                 // ✓ OPRQ.DocDueDate
  "DocDate": "16/10/2025",                    // ✓ OPRQ.DocDate
  "Reqname": "Selim Aksu",                    // ✓ OPRQ.Reqname
  "U_TalepDurum": "Satınalma Talebi",        // ✓ OPRQ.U_TalepDurum
  "U_AcilMi": true,                          // ✓ OPRQ.U_AcilMi
  "U_TalepOzeti": "Acil bakım malzemeleri",  // ✓ OPRQ.U_TalepOzeti
  "U_RevizeNedeni": null,                     // ✓ OPRQ.U_RevizeNedeni
  "U_RedNedeni": null,                        // ✓ OPRQ.U_RedNedeni
  "Comments": "Ek notlar...",                 // ✓ OPRQ.Comments
  
  // ========== Internal Fields (Not in SAP) ==========
  "itemCount": 2,                             // Internal: Calculated field
  "createdAt": "2025-10-16 19:30:31",        // Internal: Database timestamp
  "updatedAt": "2025-10-16 19:30:31",        // Internal: Database timestamp
  
  // ========== SAP PRQ1 (Lines) Fields ==========
  "items": [
    {
      "id": 1,                                // Internal: Database ID
      "OcrCode": "BAKIMHANE",                 // ✓ PRQ1.OcrCode (Departman)
      "ItemCode": "MAL001",                   // ✓ OITM.ItemCode
      "ItemName": "Vida M8",                  // ✓ OITM.ItemName
      "PQTRegdate": "20/10/2025",            // ✓ PRQ1.PQTRegdate
      "Quantity": "100",                      // ✓ PRQ1.Quantity
      "UomCode": "AD",                        // ✓ PRQ1.UomCode
      "VendorCode": "V001",                   // ✓ PRQ1.VendorCode
      "FreeTxt": "Paslanmaz olmalı",         // ✓ PRQ1.FreeTxt
      "isDummy": false                        // Internal: System field
    },
    {
      "id": 2,
      "OcrCode": "BAKIMHANE",
      "ItemCode": "MAL002",
      "ItemName": "Somun M8",
      "PQTRegdate": "20/10/2025",
      "Quantity": "200",
      "UomCode": "AD",
      "VendorCode": "V001",
      "FreeTxt": "",
      "isDummy": false
    }
  ]
}
```

## 📝 POST /api/requests - Request Body

```json
{
  // ========== SAP OPRQ Fields ==========
  "DocNum": "1009",                    // OPRQ.DocNum (Auto-generated önerilir)
  "TaxDate": "17/10/2025",             // OPRQ.TaxDate
  "Reqdate": "25/10/2025",             // OPRQ.Reqdate
  "DocDueDate": "30/10/2025",          // OPRQ.DocDueDate
  "DocDate": "17/10/2025",             // OPRQ.DocDate (Auto-generated)
  "Reqname": "Admin Kullanıcı",        // OPRQ.Reqname (Auto from session)
  "U_TalepOzeti": "Talep özeti",       // OPRQ.U_TalepOzeti
  "U_AcilMi": false,                   // OPRQ.U_AcilMi
  "Comments": "Notlar",                // OPRQ.Comments
  
  // ========== SAP PRQ1 Fields ==========
  "items": [
    {
      "OcrCode": "KONSOL",               // PRQ1.OcrCode (Departman)
      "ItemCode": "MAL100",              // OITM.ItemCode
      "ItemName": "Test Malzeme",        // OITM.ItemName
      "PQTRegdate": "25/10/2025",       // PRQ1.PQTRegdate
      "Quantity": "50",                  // PRQ1.Quantity
      "UomCode": "KG",                   // PRQ1.UomCode
      "VendorCode": "",                  // PRQ1.VendorCode (Optional)
      "FreeTxt": "Açıklama",            // PRQ1.FreeTxt (Optional)
      "isDummy": false                   // Internal
    }
  ]
}
```

## 🔄 PUT /api/requests/:id - Request Body

```json
{
  // Sadece güncellenecek OPRQ alanları
  "DocNum": "1009",
  "TaxDate": "17/10/2025",
  "Reqdate": "26/10/2025",
  "DocDueDate": "31/10/2025",
  "U_TalepOzeti": "Güncellenmiş özet",
  "U_TalepDurum": "Satınalmada",        // OPRQ.U_TalepDurum
  "U_AcilMi": true,
  "U_RevizeNedeni": "Miktar artırıldı", // OPRQ.U_RevizeNedeni
  "Comments": "Yeni notlar",
  
  // Güncellenmiş PRQ1 satırları
  "items": [
    {
      "OcrCode": "KONSOL",
      "ItemCode": "MAL100",
      "ItemName": "Test Malzeme",
      "PQTRegdate": "26/10/2025",
      "Quantity": "75",                   // Güncellenmiş miktar
      "UomCode": "KG",
      "VendorCode": "V002",               // Satıcı eklendi
      "FreeTxt": "Güncellenmiş açıklama"
    }
  ]
}
```

## ❌ KALDIRILMIŞ ALANLAR

Artık API response'da **bulunmayan** eski alanlar:

| Eski Alan | Neden Kaldırıldı | Yeni Karşılığı |
|-----------|------------------|----------------|
| `department` | SAP OPRQ'da yok | `items[].OcrCode` (Her satırda) |
| `requesterRole` | SAP'de karşılığı yok | Kaldırıldı |
| `status` | Duplicate alan | `U_TalepDurum` kullanılıyor |

## 📋 SAP ALAN KARŞILIKLARI

### OPRQ Tablosu (Header)
| API Field | SAP Field | Database Field |
|-----------|-----------|----------------|
| DocNum | OPRQ.DocNum | doc_num |
| TaxDate | OPRQ.TaxDate | tax_date |
| Reqdate | OPRQ.Reqdate | req_date |
| DocDueDate | OPRQ.DocDueDate | doc_due_date |
| DocDate | OPRQ.DocDate | doc_date |
| Reqname | OPRQ.Reqname | req_name |
| U_TalepDurum | OPRQ.U_TalepDurum | u_talep_durum |
| U_AcilMi | OPRQ.U_AcilMi | u_acil_mi |
| U_TalepOzeti | OPRQ.U_TalepOzeti | u_talep_ozeti |
| U_RevizeNedeni | OPRQ.U_RevizeNedeni | u_revize_nedeni |
| U_RedNedeni | OPRQ.U_RedNedeni | u_red_nedeni |
| Comments | OPRQ.Comments | comments |

### PRQ1 Tablosu (Lines)
| API Field | SAP Field | Database Field |
|-----------|-----------|----------------|
| OcrCode | PRQ1.OcrCode | ocr_code |
| ItemCode | OITM.ItemCode | item_code |
| ItemName | OITM.ItemName | item_name |
| PQTRegdate | PRQ1.PQTRegdate | pqt_regdate |
| Quantity | PRQ1.Quantity | quantity |
| UomCode | PRQ1.UomCode | uom_code |
| VendorCode | PRQ1.VendorCode | vendor_code |
| FreeTxt | PRQ1.FreeTxt | free_txt |

## ✅ VALİDASYON KURALLARI

### Zorunlu Alanlar (OPRQ)
- ✓ DocNum
- ✓ DocDate
- ✓ Reqname
- ✓ Reqdate
- ✓ DocDueDate
- ✓ U_TalepOzeti
- ✓ items (En az 1 satır)

### Zorunlu Alanlar (PRQ1 - Her Satır)
- ✓ OcrCode (Departman)
- ✓ ItemCode
- ✓ ItemName
- ✓ PQTRegdate
- ✓ Quantity
- ✓ UomCode

### Opsiyonel Alanlar
- TaxDate (Varsayılan: DocDate)
- U_AcilMi (Varsayılan: false)
- Comments (Varsayılan: "")
- VendorCode (Satır bazında)
- FreeTxt (Satır bazında)
- U_RevizeNedeni
- U_RedNedeni

## 🎯 ÖRNEK KULLANIM

### Yeni Talep Oluşturma
```javascript
const newRequest = {
  DocNum: "1010",
  TaxDate: "17/10/2025",
  Reqdate: "20/10/2025",
  DocDueDate: "30/10/2025",
  DocDate: "17/10/2025",
  Reqname: "Kullanıcı Adı",
  U_TalepOzeti: "Acil malzeme talebi",
  U_AcilMi: true,
  Comments: "Hemen gerekli",
  items: [
    {
      OcrCode: "BAKIMHANE",
      ItemCode: "MAL001",
      ItemName: "Vida M8",
      PQTRegdate: "20/10/2025",
      Quantity: "100",
      UomCode: "AD",
      VendorCode: "",
      FreeTxt: "Paslanmaz"
    }
  ]
};

const response = await axios.post('/api/requests', newRequest);
```

### Talep Güncelleme
```javascript
const updateRequest = {
  U_TalepDurum: "Satınalmada",
  U_AcilMi: false,
  Comments: "İnceleme altında",
  items: [/* güncellenmiş items */]
};

const response = await axios.put('/api/requests/1', updateRequest);
```

---

**Son Güncelleme:** 2025-10-16  
**Profesör de.** 👨‍🏫

