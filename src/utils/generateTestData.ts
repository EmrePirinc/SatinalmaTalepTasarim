// Test verisi oluşturma scripti
// Bu dosyayı tarayıcı konsolunda çalıştırabilirsiniz

export const generateTestData = () => {
  const statuses = [
    "Satınalmacıda",
    "Revize İstendi",
    "Reddedildi",
    "Satınalma Teklifi",
    "Satınalma Talebi",
    "Satınalma Siparişi",
    "Mal Girişi",
    "Satıcı Faturası",
    "Ödeme Yapıldı",
    "Tamamlandı",
  ]

  const departments = ["Konsol", "Bakır", "İzole", "Yönetim", "Bakımhane", "Depo"]

  const requesters = ["Selim Aksu", "Ahmet Yılmaz", "Mehmet Demir", "Ayşe Kaya", "Fatma Şahin"]

  const itemNames = [
    "Vida M8x20",
    "Somun M8",
    "Pul 8mm",
    "Kablo 3x2.5",
    "Sigorta 16A",
    "Conta NBR 50x70",
    "Rulman 6205",
    "Kayış A-1250",
    "Yağ Shell 15W40",
    "Filtre Hava",
    "Boya RAL 9016",
    "Lastik 8x2",
    "Çelik Profil 40x40",
    "Plaka 5mm",
    "Boru DN50",
  ]

  const vendors = ["Satıcı A", "Satıcı B", "Satıcı C", "Bosch", "Siemens"]

  const testData = []

  for (let i = 1; i <= 15; i++) {
    const isUrgent = i % 4 === 0
    const itemCount = Math.floor(Math.random() * 5) + 1

    const items = []
    for (let j = 1; j <= itemCount; j++) {
      const randomItem = itemNames[Math.floor(Math.random() * itemNames.length)]
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)]
      const randomDept = departments[Math.floor(Math.random() * departments.length)]

      // Dummy dosya oluştur (her 3 satırdan 1'inde dosya var)
      let file = null
      if (j % 3 === 0) {
        const content = `Bu ${randomItem} için örnek dosyadır.`
        const blob = new Blob([content], { type: 'text/plain' })
        file = new File([blob], `${randomItem.replace(/\s+/g, '_')}_belge.txt`, { type: 'text/plain' })
      }

      // SAP formatı DD/MM/YYYY için tarih oluştur
      const itemReqDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
      const itemReqMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
      const itemReqYear = '2025'

      items.push({
        id: j,
        departman: randomDept,
        itemCode: `ITM-${String(i).padStart(3, '0')}-${String(j).padStart(2, '0')}`,
        itemName: randomItem,
        requiredDate: `${itemReqDay}/${itemReqMonth}/${itemReqYear}`,
        quantity: String(Math.floor(Math.random() * 100) + 1),
        uomCode: ["AD", "KG", "LT", "MT", "M2"][Math.floor(Math.random() * 5)],
        vendor: randomVendor,
        description: j % 2 === 0 ? `${randomItem} için özel açıklama. Kalite kontrol gereklidir.` : "",
        file: file,
        isDummy: false,
      })
    }

    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomDept = departments[Math.floor(Math.random() * departments.length)]
    const randomRequester = requesters[Math.floor(Math.random() * requesters.length)]

    // SAP formatı DD/MM/YYYY için tarihler oluştur
    const docDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const docMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const docYear = '2025'

    // Gerekli tarih belge tarihinden 7-37 gün sonra
    const docDateObj = new Date(2025, parseInt(docMonth) - 1, parseInt(docDay))
    const reqDateObj = new Date(docDateObj)
    reqDateObj.setDate(reqDateObj.getDate() + Math.floor(Math.random() * 30) + 7)
    const reqDay = String(reqDateObj.getDate()).padStart(2, '0')
    const reqMonth = String(reqDateObj.getMonth() + 1).padStart(2, '0')
    const reqYear = reqDateObj.getFullYear()

    // Geçerlilik tarihi gerekli tarihten sonra
    const validDateObj = new Date(reqDateObj)
    validDateObj.setDate(validDateObj.getDate() + Math.floor(Math.random() * 60) + 30)
    const validDay = String(validDateObj.getDate()).padStart(2, '0')
    const validMonth = String(validDateObj.getMonth() + 1).padStart(2, '0')
    const validYear = validDateObj.getFullYear()

    testData.push({
      id: Date.now() + i,
      documentNumber: `DOC-2025-${String(i).padStart(4, '0')}`,
      documentDate: `${docDay}/${docMonth}/${docYear}`,
      requiredDate: `${reqDay}/${reqMonth}/${reqYear}`,
      validityDate: `${validDay}/${validMonth}/${validYear}`,
      requester: randomRequester,
      requesterRole: "Talep Açan",
      department: randomDept,
      createdDate: new Date().toLocaleDateString("tr-TR"),
      itemCount: items.length,
      status: randomStatus,
      isUrgent: isUrgent,
      requestSummary: `${randomDept} departmanı için ${items.length} kalem malzeme talebi`,
      items: items,
      notes: isUrgent ?
        "ACİL TALEP: Bu talep öncelikli olarak işlenmelidir. Üretim durması riski var." :
        i % 3 === 0 ? `${randomDept} departmanı için rutin malzeme talebi. Stok kontrolü yapılmıştır.` : undefined,
    })
  }

  // localStorage'a kaydet
  localStorage.setItem("purchaseRequests", JSON.stringify(testData))
  console.log("✅ 15 adet test verisi başarıyla oluşturuldu!")
  console.log("Test verileri:", testData)

  // Sayfa yenileme
  window.location.reload()
}

// Tarayıcı konsolunda çalıştırmak için:
// import { generateTestData } from './src/utils/generateTestData'
// generateTestData()
