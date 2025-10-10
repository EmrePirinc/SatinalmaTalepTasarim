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

      items.push({
        id: j,
        departman: randomDept,
        itemCode: `ITM-${String(i).padStart(3, '0')}-${String(j).padStart(2, '0')}`,
        itemName: randomItem,
        requiredDate: `2025-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
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

    const docDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    const reqDate = new Date(docDate)
    reqDate.setDate(reqDate.getDate() + Math.floor(Math.random() * 30) + 7)

    testData.push({
      id: Date.now() + i,
      documentNumber: `DOC-2025-${String(i).padStart(4, '0')}`,
      documentDate: `${docDate.getFullYear()}-${String(docDate.getMonth() + 1).padStart(2, '0')}-${String(docDate.getDate()).padStart(2, '0')}`,
      requiredDate: `${reqDate.getFullYear()}-${String(reqDate.getMonth() + 1).padStart(2, '0')}-${String(reqDate.getDate()).padStart(2, '0')}`,
      validityDate: `2025-12-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
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
