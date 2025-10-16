// SAP B1 tarih formatını parse eden utility fonksiyonu

export function parseSAPDate(input: string): string {
  if (!input) return ""

  const today = new Date()
  const currentDay = String(today.getDate()).padStart(2, "0")
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0")
  const currentYear = String(today.getFullYear())

  // "*" → bugünün tarihi
  if (input.trim() === "*") {
    return `${currentDay}/${currentMonth}/${currentYear}`
  }

  // "DD*" → DD/[bugünün ayı]/[bugünün yılı]
  if (input.match(/^\d{1,2}\*$/)) {
    const day = input.replace("*", "").padStart(2, "0")
    return `${day}/${currentMonth}/${currentYear}`
  }

  // "DDMM*" → DD/MM/[bugünün yılı]
  if (input.match(/^\d{3,4}\*$/)) {
    const cleaned = input.replace("*", "").padStart(4, "0")
    const day = cleaned.substring(0, 2)
    const month = cleaned.substring(2, 4)
    return `${day}/${month}/${currentYear}`
  }

  // "DDMMYYYY" → DD/MM/YYYY
  if (input.match(/^\d{8}$/)) {
    const day = input.substring(0, 2)
    const month = input.substring(2, 4)
    const year = input.substring(4, 8)
    return `${day}/${month}/${year}`
  }

  // "DDMMYY" → DD/MM/20YY
  if (input.match(/^\d{6}$/)) {
    const day = input.substring(0, 2)
    const month = input.substring(2, 4)
    const year = "20" + input.substring(4, 6)
    return `${day}/${month}/${year}`
  }

  // Eğer zaten DD/MM/YYYY formatındaysa
  if (input.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    const parts = input.split("/")
    return `${parts[0].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[2]}`
  }

  // Hiçbir formata uymuyorsa olduğu gibi döndür
  return input
}

// DD/MM/YYYY formatını YYYY-MM-DD formatına çevirir (date input için)
export function formatToISO(dateStr: string): string {
  if (!dateStr) return ""

  const parts = dateStr.split("/")
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }

  return dateStr
}

// YYYY-MM-DD formatını DD/MM/YYYY formatına çevirir
export function formatFromISO(dateStr: string): string {
  if (!dateStr) return ""

  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  return dateStr
}
