import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/Sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Package,
  Bell,
  Calendar,
  Search,
  Settings,
  User,
  Menu,
  Eye,
  LogOut,
  Info,
  Download,
} from "lucide-react"
import * as XLSX from "xlsx"

type RequestStatus =
  | "Satınalmacıda"
  | "Revize İstendi"
  | "Reddedildi"
  | "Satınalma Teklifi"
  | "Satınalma Talebi"
  | "Satınalma Siparişi"
  | "Mal Girişi"
  | "Satıcı Faturası"
  | "Ödeme Yapıldı"
  | "İade"
  | "Tamamlandı"

type RequestItem = {
  id: number
  departman: string
  itemCode: string
  itemName: string
  requiredDate: string
  quantity: string
  uomCode: string
  vendor: string
  description: string
  file: File | null
  fileData?: {
    name: string
    content: string
    type: string
  }
  isDummy?: boolean
}

type PurchaseRequest = {
  id: number
  documentNumber: string
  documentDate?: string
  requiredDate?: string
  validityDate?: string
  requester: string
  requesterRole?: string
  department: string
  createdDate: string
  itemCount: number
  status: RequestStatus
  isUrgent?: boolean
  requestSummary?: string
  items?: RequestItem[]
  notes?: string
}

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

// Tarih formatlama fonksiyonu: YYYY-MM-DD veya DD.MM.YYYY -> DD/MM/YYYY
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "-"

  // Eğer zaten DD.MM.YYYY formatındaysa (toLocaleDateString'den geliyorsa)
  if (dateStr.includes(".")) {
    return dateStr.replace(/\./g, "/")
  }

  // YYYY-MM-DD formatından DD/MM/YYYY'ye çevir
  if (dateStr.includes("-")) {
    const [year, month, day] = dateStr.split("-")
    return `${day}/${month}/${year}`
  }

  return dateStr
}

export default function TalepListesi() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    documentNumber: "",
    requestSummary: "",
    requester: "",
    department: "",
    documentDate: "",
    requiredDate: "",
    validityDate: "",
    createdDate: "",
    status: "",
  })

  useEffect(() => {
    // Kullanıcı kontrolü
    const user = localStorage.getItem("currentUser")
    if (!user) {
      navigate("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    setCurrentUser(parsedUser)

    // localStorage'dan talepleri oku
    const savedRequests = localStorage.getItem("purchaseRequests")
    if (savedRequests) {
      const parsedRequests = JSON.parse(savedRequests)

      // Kullanıcı rolüne göre filtreleme
      if (parsedUser.role === "user") {
        // Talep açan sadece kendi taleplerini görsün
        const userRequests = parsedRequests.filter((req: PurchaseRequest) => req.requester === parsedUser.name)
        setRequests(userRequests)
      } else {
        // Satınalmacı ve Admin tüm talepleri görsün
        setRequests(parsedRequests)
      }
    }
  }, [navigate])

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch =
        request.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.requestSummary && request.requestSummary.toLowerCase().includes(searchQuery.toLowerCase()))

      if (!searchMatch) return false
      if (filters.documentNumber && !request.documentNumber.toLowerCase().includes(filters.documentNumber.toLowerCase())) return false
      if (filters.requestSummary && (!request.requestSummary || !request.requestSummary.toLowerCase().includes(filters.requestSummary.toLowerCase()))) return false
      if (filters.requester && !request.requester.toLowerCase().includes(filters.requester.toLowerCase()))
        return false
      if (filters.department && request.department !== filters.department) return false
      if (filters.documentDate && request.documentDate !== filters.documentDate) return false
      if (filters.requiredDate && request.requiredDate !== filters.requiredDate) return false
      if (filters.validityDate && (!request.validityDate || request.validityDate !== filters.validityDate)) return false
      if (filters.createdDate && !request.createdDate.includes(filters.createdDate)) return false
      if (filters.status && request.status !== filters.status) return false

      return true
    })
  }, [requests, searchQuery, filters])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate("/login")
  }

  const handleViewDetails = (request: PurchaseRequest) => {
    setSelectedRequest(request)
    setIsDetailDialogOpen(true)
  }


  const handleReject = () => {
    if (!selectedRequest) return

    const reason = prompt("Reddetme sebebini giriniz:")
    if (!reason) return

    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id ? { ...req, status: "Reddedildi" as RequestStatus, notes: (req.notes || "") + "\n\nRed Sebebi: " + reason } : req
    )
    setRequests(updatedRequests)
    localStorage.setItem("purchaseRequests", JSON.stringify(updatedRequests))
    alert("Talep reddedildi!")
    setIsDetailDialogOpen(false)
  }

  const handleRevise = () => {
    if (!selectedRequest) return

    const revisionNote = prompt("Revize notunu giriniz:")
    if (!revisionNote) return

    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id ? { ...req, status: "Revize İstendi" as RequestStatus, notes: (req.notes || "") + "\n\nRevize Notu: " + revisionNote } : req
    )
    setRequests(updatedRequests)
    localStorage.setItem("purchaseRequests", JSON.stringify(updatedRequests))
    alert("Revize talebi gönderildi!")
    setIsDetailDialogOpen(false)
  }

  const handleResubmitAfterRevision = () => {
    if (!selectedRequest) return

    const confirmMessage = "Talebi güncellemek ve tekrar göndermek istiyor musunuz?"
    if (!confirm(confirmMessage)) return

    const updatedRequests = requests.map((req) =>
      req.id === selectedRequest.id
        ? { ...req, status: "Satınalma Talebi" as RequestStatus, notes: (req.notes || "") + "\n\n[Revize sonrası tekrar gönderildi: " + new Date().toLocaleDateString("tr-TR") + "]" }
        : req
    )
    setRequests(updatedRequests)
    localStorage.setItem("purchaseRequests", JSON.stringify(updatedRequests))
    alert("Talep güncellenerek tekrar gönderildi!")
    setIsDetailDialogOpen(false)
  }

  const handleGenerateTestData = () => {
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
      "Vida M8x20", "Somun M8", "Pul 8mm", "Kablo 3x2.5", "Sigorta 16A",
      "Conta NBR 50x70", "Rulman 6205", "Kayış A-1250", "Yağ Shell 15W40", "Filtre Hava",
      "Boya RAL 9016", "Lastik 8x2", "Çelik Profil 40x40", "Plaka 5mm", "Boru DN50",
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

        let fileData = undefined
        if (j % 3 === 0) {
          const content = `Bu ${randomItem} için örnek dosyadır.\nDosya içeriği: Teknik özellikler ve gereksinimler.\n\nMalzeme: ${randomItem}\nMiktar: ${Math.floor(Math.random() * 100) + 1}\nTarih: ${new Date().toLocaleDateString('tr-TR')}`
          fileData = {
            name: `${randomItem.replace(/\s+/g, '_')}_belge.txt`,
            content: content,
            type: 'text/plain'
          }
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
          file: null,
          fileData: fileData,
          isDummy: false,
        })
      }

      // İlk 5 talebi "Satınalmacıda" yap ki butonlar test edilebilsin
      const randomStatus = i <= 5 ? "Satınalmacıda" : statuses[Math.floor(Math.random() * statuses.length)]
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

    localStorage.setItem("purchaseRequests", JSON.stringify(testData))
    alert("✅ 15 adet test verisi başarıyla oluşturuldu!")
    window.location.reload()
  }

  const handleExportToExcel = () => {
    // Excel için detaylı veri hazırlama - her kalem için ayrı satır
    const excelData: any[] = []

    filteredRequests.forEach((request) => {
      if (request.items && request.items.length > 0) {
        // Her kalem için ayrı satır oluştur
        request.items.forEach((item, index) => {
          excelData.push({
            "Doküman No": request.documentNumber,
            "Talep Özeti": request.requestSummary || "-",
            "Talep Eden": request.requester,
            "Talep Eden Departmanı": request.department,
            "Belge Tarihi": formatDate(request.documentDate),
            "Gerekli Tarih (Genel)": formatDate(request.requiredDate),
            "Geçerlilik Tarihi": request.validityDate ? formatDate(request.validityDate) : "-",
            "Kayıt Tarihi": formatDate(request.createdDate),
            "Acil": request.isUrgent ? "Evet" : "Hayır",
            "Durum": request.status,
            "Açıklamalar ve Notlar": request.notes || "-",
            // Kalem detayları
            "Satır No": index + 1,
            "Kalem Kodu": item.itemCode,
            "Kalem Tanımı": item.itemName,
            "Kalem Departmanı": item.departman,
            "Kalem Gerekli Tarih": formatDate(item.requiredDate),
            "Miktar": item.quantity,
            "Birim": item.uomCode,
            "Satıcı": item.vendor || "-",
            "Kalem Açıklaması": item.description || "-",
            "Ek Dosya": (item.file || item.fileData) ? (item.file?.name || item.fileData?.name) : "-",
          })
        })
      } else {
        // Kalem yoksa sadece talep bilgilerini ekle
        excelData.push({
          "Doküman No": request.documentNumber,
          "Talep Özeti": request.requestSummary || "-",
          "Talep Eden": request.requester,
          "Talep Eden Departmanı": request.department,
          "Belge Tarihi": formatDate(request.documentDate),
          "Gerekli Tarih (Genel)": formatDate(request.requiredDate),
          "Geçerlilik Tarihi": request.validityDate ? formatDate(request.validityDate) : "-",
          "Kayıt Tarihi": formatDate(request.createdDate),
          "Acil": request.isUrgent ? "Evet" : "Hayır",
          "Durum": request.status,
          "Açıklamalar ve Notlar": request.notes || "-",
          "Satır No": "-",
          "Kalem Kodu": "-",
          "Kalem Tanımı": "-",
          "Kalem Departmanı": "-",
          "Kalem Gerekli Tarih": "-",
          "Miktar": "-",
          "Birim": "-",
          "Satıcı": "-",
          "Kalem Açıklaması": "-",
          "Ek Dosya": "-",
        })
      }
    })

    // Worksheet oluştur
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Kolon genişliklerini ayarla
    const columnWidths = [
      { wch: 15 }, // Doküman No
      { wch: 30 }, // Talep Özeti
      { wch: 20 }, // Talep Eden
      { wch: 15 }, // Talep Eden Departmanı
      { wch: 15 }, // Belge Tarihi
      { wch: 18 }, // Gerekli Tarih (Genel)
      { wch: 18 }, // Geçerlilik Tarihi
      { wch: 15 }, // Kayıt Tarihi
      { wch: 10 }, // Acil
      { wch: 20 }, // Durum
      { wch: 40 }, // Açıklamalar ve Notlar
      { wch: 10 }, // Satır No
      { wch: 20 }, // Kalem Kodu
      { wch: 25 }, // Kalem Tanımı
      { wch: 15 }, // Kalem Departmanı
      { wch: 18 }, // Kalem Gerekli Tarih
      { wch: 10 }, // Miktar
      { wch: 10 }, // Birim
      { wch: 15 }, // Satıcı
      { wch: 35 }, // Kalem Açıklaması
      { wch: 20 }, // Ek Dosya
    ]
    ws["!cols"] = columnWidths

    // Workbook oluştur
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Talep Detayları")

    // Dosya adı oluştur (tarih içeren)
    const today = new Date()
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
    const fileName = `Satinalma_Talep_Detaylari_${dateStr}.xlsx`

    // Excel dosyasını indir
    XLSX.writeFile(wb, fileName)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Modern Header - Zwilling Style */}
        <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded hover:bg-gray-50 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-gray-800">Talep Listesi</h1>
              <span className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>Tüm Talepler</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex w-8 h-8 items-center justify-center rounded hover:bg-gray-50 transition-colors relative group">
              <Bell className="w-4 h-4 text-gray-500" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></div>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Bildirimler
              </span>
            </button>
            <button className="hidden sm:flex w-8 h-8 items-center justify-center rounded hover:bg-gray-50 transition-colors group">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Ayarlar
              </span>
            </button>
            <div className="flex items-center gap-2.5 ml-2 pl-3 border-l border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: "linear-gradient(135deg, #FF6B1A 0%, #FF8C42 100%)" }}
                >
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-xs font-medium text-gray-700 leading-tight">{currentUser?.name}</span>
                  <span className="text-[10px] text-gray-400 leading-tight">
                    {currentUser?.role === "purchaser" ? "Satınalmacı" : currentUser?.role === "user" ? "Talep Açan" : "Admin"}
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="icon" 
                className="w-7 h-7 hover:bg-red-50 hover:text-red-600 transition-colors" 
                title="Çıkış Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-2 md:p-4">
          <div className="w-full">
            <div className="bg-card rounded-lg border border-border shadow-sm p-3 md:p-4">
              <h3
                className="text-lg md:text-2xl font-bold mb-4 md:mb-6 pb-2 md:pb-3 border-b-2"
                style={{ color: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30, 0.2)" }}
              >
                Satınalma Talep Listesi
              </h3>

              {/* Search & Export */}
              <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                  <Input
                    placeholder="Doküman numarası, talep eden veya departmana göre ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                <Button
                  onClick={handleGenerateTestData}
                  variant="outline"
                  className="flex items-center gap-2 text-sm font-medium"
                  title="15 Adet Test Verisi Oluştur"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden lg:inline">Test Verisi</span>
                </Button>
                <Button
                  onClick={handleExportToExcel}
                  className="flex items-center gap-2 text-sm font-medium"
                  style={{ backgroundColor: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30)" }}
                  title="Excel'e Aktar"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Excel'e Aktar</span>
                </Button>
              </div>

              {/* Table - Yatay Kaydırma */}
              <div className="table-scroll overflow-x-scroll overflow-y-visible border border-border rounded-lg shadow-sm" style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#FF6B1A #f3f4f6'
              }}>
                <style dangerouslySetInnerHTML={{__html: `
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
                  .table-scroll::-webkit-scrollbar-thumb:hover {
                    background: #FF8C42;
                  }
                  /* Takvim ikonunu gizle ama işlevselliği koru */
                  input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    left: 0;
                    top: 0;
                  }
                  input[type="date"] {
                    position: relative;
                  }
                `}} />
                <div className="overflow-hidden min-w-[1520px]">
                  {/* Filter Row - Compact */}
                  <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
                    <div className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_120px_70px_130px_80px]">
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          placeholder="Filtrele..."
                          className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                          value={filters.documentNumber}
                          onChange={(e) => setFilters({ ...filters, documentNumber: e.target.value })}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          placeholder="Filtrele..."
                          className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                          value={filters.requestSummary}
                          onChange={(e) => setFilters({ ...filters, requestSummary: e.target.value })}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          placeholder="Filtrele..."
                          className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                          value={filters.requester}
                          onChange={(e) => setFilters({ ...filters, requester: e.target.value })}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <select
                          className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                          value={filters.department}
                          onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                        >
                          <option value="">Tümü</option>
                          <option value="Konsol">Konsol</option>
                          <option value="Bakır">Bakır</option>
                          <option value="İzole">İzole</option>
                          <option value="Yönetim">Yönetim</option>
                          <option value="Bakımhane">Bakımhane</option>
                          <option value="Depo">Depo</option>
                        </select>
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          type="date"
                          className="h-7 text-[10px] bg-white border-gray-200 px-1 w-full cursor-pointer"
                          value={filters.documentDate}
                          onChange={(e) => setFilters({ ...filters, documentDate: e.target.value })}
                          onClick={(e) => {
                            const input = e.currentTarget as HTMLInputElement
                            if ('showPicker' in input && typeof input.showPicker === 'function') {
                              try { input.showPicker() } catch (error) { console.warn('showPicker failed:', error) }
                            }
                          }}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          type="date"
                          className="h-7 text-[10px] bg-white border-gray-200 px-1 w-full cursor-pointer"
                          value={filters.requiredDate}
                          onChange={(e) => setFilters({ ...filters, requiredDate: e.target.value })}
                          onClick={(e) => {
                            const input = e.currentTarget as HTMLInputElement
                            if ('showPicker' in input && typeof input.showPicker === 'function') {
                              try { input.showPicker() } catch (error) { console.warn('showPicker failed:', error) }
                            }
                          }}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          type="date"
                          className="h-7 text-[10px] bg-white border-gray-200 px-1 w-full cursor-pointer"
                          value={filters.validityDate}
                          onChange={(e) => setFilters({ ...filters, validityDate: e.target.value })}
                          onClick={(e) => {
                            const input = e.currentTarget as HTMLInputElement
                            if ('showPicker' in input && typeof input.showPicker === 'function') {
                              try { input.showPicker() } catch (error) { console.warn('showPicker failed:', error) }
                            }
                          }}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          placeholder="gg.aa.yyyy"
                          className="h-7 text-[10px] bg-white border-gray-200 px-1 w-full"
                          value={filters.createdDate}
                          onChange={(e) => setFilters({ ...filters, createdDate: e.target.value })}
                        />
                      </div>
                      <div className="px-1 py-1.5 border-r border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-400">⚠️</span>
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <select
                          className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
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
                        </select>
                      </div>
                      <div className="px-1 py-1.5 flex items-center justify-center">
                        <button
                          onClick={() => setFilters({
                            documentNumber: "",
                            requestSummary: "",
                            requester: "",
                            department: "",
                            documentDate: "",
                            requiredDate: "",
                            validityDate: "",
                            createdDate: "",
                            status: ""
                          })}
                          className="text-xs text-gray-400 hover:text-orange-500 transition-colors"
                          title="Filtreleri Temizle"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Header Row */}
                  <div className="bg-[#ECF2FF] border-b border-border sticky top-[40px] z-10">
                    <div className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_120px_70px_130px_80px]">
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Doküman No
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Talep Özeti
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Talep Eden
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Departman
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Belge Tarihi
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Gerekli Tarih
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Geçerlilik Tarihi
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Kayıt Tarihi
                      </div>
                      <div className="px-2 py-3 border-r border-border text-sm font-medium text-[#181C14] text-center">
                        Acil
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">Durum</div>
                      <div className="px-3 py-3 text-sm font-medium text-[#181C14] text-center">İşlemler</div>
                    </div>
                  </div>

                  {/* Data Rows */}
                  {filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_120px_70px_130px_80px] border-b border-border bg-white hover:bg-orange-50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(request)}
                    >
                      <div className="px-3 py-3 border-r border-border text-sm">{request.documentNumber}</div>
                      <div className="px-3 py-3 border-r border-border text-sm truncate">{request.requestSummary || "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.requester}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.department}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{formatDate(request.documentDate)}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{formatDate(request.requiredDate)}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.validityDate ? formatDate(request.validityDate) : "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{formatDate(request.createdDate)}</div>
                      <div className="px-2 py-3 border-r border-border flex items-center justify-center">
                        {request.isUrgent ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold shadow-md" title="Acil Talep">
                            ⚠️
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                      <div className="px-3 py-3 border-r border-border">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[request.status]}`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <div className="px-2 py-2 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Footer */}
                  <div className="px-4 py-3 text-sm text-muted-foreground flex justify-end bg-muted/30">
                    <span>Toplam {filteredRequests.length} talep var</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Kalem Detayları Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[98vw] md:max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="border-b-2 pb-4" style={{ borderColor: "rgba(237, 124, 30, 0.2)" }}>
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl font-bold" style={{ color: "rgba(237, 124, 30)" }}>
              <span>📋 Doküman No: {selectedRequest?.documentNumber}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 pt-4">
              {/* Talep Özeti - Başlık */}
              {selectedRequest.requestSummary && (
                <div className="relative overflow-hidden rounded-xl shadow-md p-6" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)", borderLeft: "4px solid rgba(237, 124, 30, 1)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>📝 Talep Özeti</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 leading-relaxed">{selectedRequest.requestSummary}</p>
                </div>
              )}

              {/* Durum ve Acil Talep Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 min-w-[160px] justify-center ${statusColors[selectedRequest.status]}`}
                >
                  {selectedRequest.status}
                </span>
                {selectedRequest.isUrgent && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold shadow-lg min-w-[160px] justify-center border-2 border-red-600">
                    <span>⚠️</span>
                    <span>ACİL TALEP</span>
                  </span>
                )}
              </div>

              {/* Genel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👤</span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>Talep Eden</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 ml-8">{selectedRequest.requester}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏢</span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>Departman</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 ml-8">{selectedRequest.department}</p>
                </div>
                <div className={`rounded-xl shadow-md border-2 p-5 hover:shadow-lg transition-shadow ${
                  selectedRequest.isUrgent
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedRequest.isUrgent ? '⚠️' : '✅'}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      selectedRequest.isUrgent ? 'text-red-600' : 'text-green-600'
                    }`}>Aciliyet Durumu</span>
                  </div>
                  <p className={`text-lg font-bold ml-8 ${
                    selectedRequest.isUrgent ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {selectedRequest.isUrgent ? 'ACİL TALEP' : 'Normal'}
                  </p>
                </div>
              </div>

              {/* Tarihler Bölümü */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Calendar className="w-6 h-6" style={{ color: "rgba(237, 124, 30)" }} />
                  <span className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Tarihler</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-gray-900 text-white p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          <strong>📄 Belge Tarihi:</strong> Talebin belge üzerindeki tarihi<br />
                          <strong>⏰ Gerekli Tarih:</strong> Malzemenin ihtiyaç duyulduğu tarih<br />
                          <strong>💾 Kayıt Tarihi:</strong> Talebin sisteme girildiği tarih<br />
                          <strong>✅ Geçerlilik Tarihi:</strong> Talebin geçerli olduğu son tarih
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">📄 Belge Tarihi</span>
                    <p className="text-lg font-bold text-gray-800">{formatDate(selectedRequest.documentDate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>⏰ Gerekli Tarih</span>
                    <p className="text-lg font-bold" style={{ color: "rgba(237, 124, 30)" }}>{formatDate(selectedRequest.requiredDate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">💾 Kayıt Tarihi</span>
                    <p className="text-lg font-bold text-gray-800">{formatDate(selectedRequest.createdDate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-700">✅ Geçerlilik Tarihi</span>
                    <p className="text-lg font-bold text-green-800">{formatDate(selectedRequest.validityDate)}</p>
                  </div>
                </div>
              </div>

              {/* Kalem Listesi */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Package className="w-6 h-6" style={{ color: "rgba(237, 124, 30)" }} />
                    <h4 className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Kalem Listesi</h4>
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase shadow-sm" style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", color: "rgba(237, 124, 30)" }}>
                      {selectedRequest.items.length} Kalem
                    </span>
                  </div>
                  <div className="border-2 rounded-lg overflow-hidden shadow-sm" style={{ borderColor: "rgba(237, 124, 30, 0.2)" }}>
                    <Table>
                      <TableHeader style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)" }}>
                        <TableRow>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Kalem Kodu</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Kalem Tanımı</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Departman</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Miktar</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Birim</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Satıcı</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Gerekli Tarih</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Açıklama</TableHead>
                          <TableHead className="font-bold text-center" style={{ color: "rgba(237, 124, 30)" }}>Ek Dosya</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequest.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.isDummy && <span className="text-orange-600 mr-1" title="Dummy Kalem">🔸</span>}
                              {item.itemCode}
                            </TableCell>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.departman}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.uomCode}</TableCell>
                            <TableCell>{item.vendor || "-"}</TableCell>
                            <TableCell>{formatDate(item.requiredDate)}</TableCell>
                            <TableCell className="max-w-xs">
                              {item.description ? (
                                <div className="text-sm text-gray-700">{item.description}</div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {(item.file || item.fileData) ? (
                                <button
                                  onClick={() => {
                                    // Dosya indirme işlemi
                                    if (item.file) {
                                      const url = URL.createObjectURL(item.file)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = item.file.name
                                      document.body.appendChild(a)
                                      a.click()
                                      document.body.removeChild(a)
                                      URL.revokeObjectURL(url)
                                    } else if (item.fileData) {
                                      const blob = new Blob([item.fileData.content], { type: item.fileData.type })
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = item.fileData.name
                                      document.body.appendChild(a)
                                      a.click()
                                      document.body.removeChild(a)
                                      URL.revokeObjectURL(url)
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors hover:opacity-80"
                                  style={{
                                    backgroundColor: "rgba(237, 124, 30, 0.1)",
                                    color: "rgba(237, 124, 30)",
                                    border: "1px solid rgba(237, 124, 30, 0.3)"
                                  }}
                                  title={`İndir: ${item.file?.name || item.fileData?.name}`}
                                >
                                  <span>📎</span>
                                  <span className="max-w-[100px] truncate">{item.file?.name || item.fileData?.name}</span>
                                </button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Notlar */}
              {selectedRequest.notes && (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6" style={{ borderLeft: "4px solid rgba(237, 124, 30, 1)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📝</span>
                    <span className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Açıklamalar ve Notlar</span>
                  </div>
                  <div className="p-5 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.05) 0%, rgba(237, 124, 30, 0.02) 100%)", border: "1px solid rgba(237, 124, 30, 0.1)" }}>
                    <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Satınalmacı Butonları */}
          {selectedRequest && currentUser?.role === "purchaser" && (selectedRequest.status === "Satınalmacıda" || selectedRequest.status === "Satınalma Talebi") && (
            <DialogFooter className="gap-2">
              <Button
                onClick={handleReject}
                variant="destructive"
                className="text-sm"
              >
                Reddet
              </Button>
              <Button
                onClick={handleRevise}
                variant="outline"
                className="text-sm"
              >
                Revize İste
              </Button>
            </DialogFooter>
          )}

          {/* Talep Sahibi - Revize Durumu Butonu */}
          {selectedRequest && currentUser?.role === "user" && selectedRequest.status === "Revize İstendi" && selectedRequest.requester === currentUser?.name && (
            <DialogFooter className="gap-2">
              <Button
                onClick={handleResubmitAfterRevision}
                className="text-sm"
                style={{ backgroundColor: "rgba(237, 124, 30)" }}
              >
                Güncelle ve Tekrar Gönder
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
