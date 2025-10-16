import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

// SAP PRQ1 Line Item Type
type RequestItem = {
  id: number
  OcrCode: string // PRQ1.OcrCode (Departman)
  ItemCode: string // OITM.ItemCode
  ItemName: string // OITM.ItemName
  PQTRegdate: string // PRQ1.PQTRegdate
  Quantity: string // PRQ1.Quantity
  UomCode: string // PRQ1.UomCode
  VendorCode: string // PRQ1.VendorCode
  FreeTxt: string // PRQ1.FreeTxt
  file: File | null
  fileData?: {
    name: string
    content: string
    type: string
  }
  isDummy?: boolean
}

// SAP OPRQ Header Type
type PurchaseRequest = {
  id: number
  DocNum: string // OPRQ.DocNum
  TaxDate?: string // OPRQ.TaxDate
  Reqdate?: string // OPRQ.Reqdate
  DocDueDate?: string // OPRQ.DocDueDate
  DocDate: string // OPRQ.DocDate
  Reqname: string // OPRQ.Reqname
  U_TalepDurum: RequestStatus // OPRQ.U_TalepDurum
  U_AcilMi?: boolean // OPRQ.U_AcilMi
  U_TalepOzeti?: string // OPRQ.U_TalepOzeti
  Comments?: string // OPRQ.Comments
  itemCount: number
  items?: RequestItem[]
  createdAt?: string
  updatedAt?: string
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
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isReviseDialogOpen, setIsReviseDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [reviseReason, setReviseReason] = useState("")
  const [filters, setFilters] = useState({
    DocNum: "",
    U_TalepOzeti: "",
    Reqname: "",
    OcrCode: "",
    TaxDate: "",
    Reqdate: "",
    DocDueDate: "",
    DocDate: "",
    U_TalepDurum: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)

  useEffect(() => {
    // userId'yi localStorage'dan oku
    const userId = localStorage.getItem("userId")
    if (!userId) {
      navigate("/login")
      return
    }

    // Backend'den kullanıcı bilgilerini çek
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/auth/me/${userId}`)
        if (!response.ok) {
          throw new Error('Kullanıcı bilgisi alınamadı')
        }
        const user = await response.json()
        setCurrentUser(user)

        // Backend API'den talepleri çek
        await fetchRequestsFromBackend(user)
      } catch (error) {
        console.error('User fetch error:', error)
        localStorage.removeItem("userId")
        localStorage.removeItem("userRole")
        navigate("/login")
      }
    }

    fetchCurrentUser()
  }, [navigate])

  // Backend'den talepleri çekme fonksiyonu (SAP format)
  const fetchRequestsFromBackend = async (user: any) => {
    try {
      const response = await fetch(`http://localhost:3001/api/requests?userId=${user.id}&userRole=${user.role}`)
      const data = await response.json()
      
      // Backend SAP formatını direkt kullan
      const formattedRequests: PurchaseRequest[] = data.map((req: any) => ({
        id: req.id,
        DocNum: req.DocNum,
        TaxDate: req.TaxDate,
        Reqdate: req.Reqdate,
        DocDueDate: req.DocDueDate,
        DocDate: req.DocDate,
        Reqname: req.Reqname,
        U_TalepDurum: (req.U_TalepDurum || req.status) as RequestStatus,
        U_AcilMi: req.U_AcilMi,
        U_TalepOzeti: req.U_TalepOzeti,
        Comments: req.Comments,
        itemCount: req.itemCount || req.items?.length || 0,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        items: req.items?.map((item: any) => ({
          id: item.id,
          OcrCode: item.OcrCode,
          ItemCode: item.ItemCode,
          ItemName: item.ItemName,
          PQTRegdate: item.PQTRegdate,
          Quantity: item.Quantity,
          UomCode: item.UomCode,
          VendorCode: item.VendorCode || '',
          FreeTxt: item.FreeTxt || '',
          file: null,
          isDummy: item.isDummy
        })) || []
      }))
      
      setRequests(formattedRequests)
      
      // localStorage'a da kaydet (offline çalışma için)
      localStorage.setItem("purchaseRequests", JSON.stringify(formattedRequests))
    } catch (error) {
      console.error('Backend API hatası:', error)
      
      // Hata durumunda localStorage'dan yükle
      const savedRequests = localStorage.getItem("purchaseRequests")
      if (savedRequests) {
        const parsedRequests = JSON.parse(savedRequests)
        setRequests(parsedRequests)
      }
    }
  }

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchMatch =
        request.DocNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.Reqname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (request.U_TalepOzeti && request.U_TalepOzeti.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (request.items && request.items.some(item => item.OcrCode.toLowerCase().includes(searchQuery.toLowerCase())))

      if (!searchMatch) return false
      if (filters.DocNum && !request.DocNum.toLowerCase().includes(filters.DocNum.toLowerCase())) return false
      if (filters.U_TalepOzeti && (!request.U_TalepOzeti || !request.U_TalepOzeti.toLowerCase().includes(filters.U_TalepOzeti.toLowerCase()))) return false
      if (filters.Reqname && !request.Reqname.toLowerCase().includes(filters.Reqname.toLowerCase()))
        return false
      if (filters.OcrCode && request.items && !request.items.some(item => item.OcrCode === filters.OcrCode)) return false
      if (filters.TaxDate && request.TaxDate !== filters.TaxDate) return false
      if (filters.Reqdate && request.Reqdate !== filters.Reqdate) return false
      if (filters.DocDueDate && (!request.DocDueDate || request.DocDueDate !== filters.DocDueDate)) return false
      if (filters.DocDate && !request.DocDate.includes(filters.DocDate)) return false
      if (filters.U_TalepDurum && request.U_TalepDurum !== filters.U_TalepDurum) return false

      return true
    })
  }, [requests, searchQuery, filters])

  // Sayfalama için hesaplamalar
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(startIndex, endIndex)
  }, [filteredRequests, startIndex, endIndex])

  // Filtre değiştiğinde ilk sayfaya dön
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  const handleViewDetails = (request: PurchaseRequest) => {
    setSelectedRequest(request)
    setIsDetailDialogOpen(true)
  }


  const handleRejectClick = () => {
    setIsRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert("Lütfen reddetme sebebini giriniz!")
      return
    }

    try {
      // Backend API'ye PUT request gönder
      const response = await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedRequest,
          U_TalepDurum: "Reddedildi",
          U_RedNedeni: (selectedRequest.U_RedNedeni || "") + "\n\nRed Sebebi: " + rejectReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Talep reddedilemedi')
      }

      // Listeyi yeniden yükle
      await fetchRequestsFromBackend()

      alert("Talep reddedildi!")
      setRejectReason("")
      setIsRejectDialogOpen(false)
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Reject error:', error)
      alert('Talep reddedilirken bir hata oluştu!')
    }
  }

  const handleReviseClick = () => {
    setIsReviseDialogOpen(true)
  }

  const handleReviseConfirm = async () => {
    if (!selectedRequest || !reviseReason.trim()) {
      alert("Lütfen revize sebebini giriniz!")
      return
    }

    try {
      // Backend API'ye PUT request gönder
      const response = await fetch(`http://localhost:3001/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedRequest,
          U_TalepDurum: "Revize İstendi",
          U_RevizeNedeni: (selectedRequest.U_RevizeNedeni || "") + "\n\nRevize Notu: " + reviseReason,
        }),
      })

      if (!response.ok) {
        throw new Error('Revize talebi gönderilemedi')
      }

      // Listeyi yeniden yükle
      await fetchRequestsFromBackend()

      alert("Revize talebi gönderildi!")
      setReviseReason("")
      setIsReviseDialogOpen(false)
      setIsDetailDialogOpen(false)
    } catch (error) {
      console.error('Revise error:', error)
      alert('Revize talebi gönderilirken bir hata oluştu!')
    }
  }

  const handleEditAndResubmit = () => {
    if (!selectedRequest) return

    // Talebi düzenleme modunda açmak için navigate state ile gönder
    navigate("/", { state: { editingRequest: selectedRequest } })
  }

  const handleExportToExcel = () => {
    // Excel için detaylı veri hazırlama - her kalem için ayrı satır
    const excelData: any[] = []

    filteredRequests.forEach((request: any) => {
      if (request.items && request.items.length > 0) {
        // Her kalem için ayrı satır oluştur
        request.items.forEach((item: any, index: number) => {
          excelData.push({
            "Doküman No": request.DocNum,
            "Talep Özeti": request.U_TalepOzeti || "-",
            "Talep Eden": request.Reqname,
            "Talep Eden Departmanı": item.OcrCode || "-",
            "Belge Tarihi": formatDate(request.TaxDate),
            "Gerekli Tarih (Genel)": formatDate(request.Reqdate),
            "Geçerlilik Tarihi": request.DocDueDate ? formatDate(request.DocDueDate) : "-",
            "Kayıt Tarihi": formatDate(request.DocDate),
            "Acil": request.U_AcilMi ? "Evet" : "Hayır",
            "Durum": request.U_TalepDurum,
            "Açıklamalar ve Notlar": request.Comments || "-",
            // Kalem detayları
            "Satır No": index + 1,
            "Kalem Kodu": item.ItemCode,
            "Kalem Tanımı": item.ItemName,
            "Kalem Departmanı": item.OcrCode,
            "Kalem Gerekli Tarih": formatDate(item.PQTRegdate),
            "Miktar": item.Quantity,
            "Birim": item.UomCode,
            "Satıcı": item.VendorCode || "-",
            "Kalem Açıklaması": item.FreeTxt || "-",
            "Ek Dosya": (item.file || item.fileData) ? (item.file?.name || item.fileData?.name) : "-",
          })
        })
      } else {
        // Kalem yoksa sadece talep bilgilerini ekle
        excelData.push({
          "Doküman No": request.DocNum,
          "Talep Özeti": request.U_TalepOzeti || "-",
          "Talep Eden": request.Reqname,
          "Talep Eden Departmanı": "-",
          "Belge Tarihi": formatDate(request.TaxDate),
          "Gerekli Tarih (Genel)": formatDate(request.Reqdate),
          "Geçerlilik Tarihi": request.DocDueDate ? formatDate(request.DocDueDate) : "-",
          "Kayıt Tarihi": formatDate(request.DocDate),
          "Acil": request.U_AcilMi ? "Evet" : "Hayır",
          "Durum": request.U_TalepDurum,
          "Açıklamalar ve Notlar": request.Comments || "-",
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
                          value={filters.DocNum}
                          onChange={(e) => setFilters({ ...filters, DocNum: e.target.value })}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          placeholder="Filtrele..."
                          className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                          value={filters.U_TalepOzeti}
                          onChange={(e) => setFilters({ ...filters, U_TalepOzeti: e.target.value })}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <Input
                          placeholder="Filtrele..."
                          className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                          value={filters.Reqname}
                          onChange={(e) => setFilters({ ...filters, Reqname: e.target.value })}
                        />
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <select
                          className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                          value={filters.OcrCode}
                          onChange={(e) => setFilters({ ...filters, OcrCode: e.target.value })}
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
                          value={filters.TaxDate}
                          onChange={(e) => setFilters({ ...filters, TaxDate: e.target.value })}
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
                          value={filters.Reqdate}
                          onChange={(e) => setFilters({ ...filters, Reqdate: e.target.value })}
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
                          value={filters.DocDueDate}
                          onChange={(e) => setFilters({ ...filters, DocDueDate: e.target.value })}
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
                          value={filters.DocDate}
                          onChange={(e) => setFilters({ ...filters, DocDate: e.target.value })}
                        />
                      </div>
                      <div className="px-1 py-1.5 border-r border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-400">⚠️</span>
                      </div>
                      <div className="px-1.5 py-1.5 border-r border-gray-200">
                        <select
                          className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                          value={filters.U_TalepDurum}
                          onChange={(e) => setFilters({ ...filters, U_TalepDurum: e.target.value })}
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
                        Doküman No (DocNum)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Talep Özeti (U_TalepOzeti)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Talep Eden (Reqname)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Departman (OcrCode)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Belge Tarihi (TaxDate)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Gerekli Tarih (Reqdate)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Geçerlilik T. (DocDueDate)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                        Kayıt Tarihi (DocDate)
                      </div>
                      <div className="px-2 py-3 border-r border-border text-sm font-medium text-[#181C14] text-center">
                        Acil (U_AcilMi)
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">Durum (U_TalepDurum)</div>
                      <div className="px-3 py-3 text-sm font-medium text-[#181C14] text-center">İşlemler</div>
                    </div>
                  </div>

                  {/* Data Rows */}
                  {paginatedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_120px_70px_130px_80px] border-b border-border bg-white hover:bg-orange-50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(request)}
                    >
                      <div className="px-3 py-3 border-r border-border text-sm">{request.DocNum}</div>
                      <div className="px-3 py-3 border-r border-border text-sm truncate">{request.U_TalepOzeti || "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.Reqname}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.items && request.items.length > 0 ? request.items[0].OcrCode : "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{formatDate(request.TaxDate)}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{formatDate(request.Reqdate)}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.DocDueDate ? formatDate(request.DocDueDate) : "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{formatDate(request.DocDate)}</div>
                      <div className="px-2 py-3 border-r border-border flex items-center justify-center">
                        {request.U_AcilMi ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white text-sm font-bold shadow-md" title="Acil Talep">
                            ⚠️
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                      <div className="px-3 py-3 border-r border-border">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[request.U_TalepDurum]}`}
                        >
                          {request.U_TalepDurum}
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

                  {/* Footer - Pagination */}
                  <div className="px-4 py-3 bg-muted/30 border-t border-border">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Sol - Toplam ve Sayfa Bilgisi */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Toplam <strong className="text-gray-700">{filteredRequests.length}</strong> talep</span>
                        <span className="text-gray-300">|</span>
                        <span>Sayfa <strong className="text-gray-700">{currentPage}</strong> / {totalPages}</span>
                        <span className="text-gray-300">|</span>
                        <span>Gösterilen: <strong className="text-gray-700">{startIndex + 1}-{Math.min(endIndex, filteredRequests.length)}</strong></span>
                      </div>

                      {/* Sağ - Sayfalama Kontrolleri */}
                      <div className="flex items-center gap-2">
                        {/* Sayfa Başına Kayıt Seçici */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Sayfa başına:</span>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value))
                              setCurrentPage(1)
                            }}
                            className="h-8 text-xs bg-white border border-gray-200 rounded-md px-2"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>

                        <span className="text-gray-300">|</span>

                        {/* Sayfa Navigasyonu */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="İlk Sayfa"
                          >
                            ««
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Önceki Sayfa"
                          >
                            ‹
                          </button>

                          {/* Sayfa Numaraları */}
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // İlk 2 sayfa, son 2 sayfa ve mevcut sayfa civarı
                              return (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              )
                            })
                            .map((page, index, arr) => {
                              // Sayfa atlaması varsa ... göster
                              const showEllipsis = index > 0 && page - arr[index - 1] > 1
                              return (
                                <div key={page} className="flex items-center">
                                  {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                  <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 text-xs rounded transition-colors ${
                                      currentPage === page
                                        ? 'font-bold text-white shadow-md'
                                        : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                                    style={
                                      currentPage === page
                                        ? { backgroundColor: 'rgba(237, 124, 30)' }
                                        : {}
                                    }
                                  >
                                    {page}
                                  </button>
                                </div>
                              )
                            })}

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Sonraki Sayfa"
                          >
                            ›
                          </button>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Son Sayfa"
                          >
                            »»
                          </button>
                        </div>
                      </div>
                    </div>
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
              <span>📋 Doküman No: {selectedRequest?.DocNum}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 pt-4">
              {/* Talep Özeti - Başlık */}
              {selectedRequest.U_TalepOzeti && (
                <div className="relative overflow-hidden rounded-xl shadow-md p-6" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)", borderLeft: "4px solid rgba(237, 124, 30, 1)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>📝 Talep Özeti</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 leading-relaxed">{selectedRequest.U_TalepOzeti}</p>
                </div>
              )}

              {/* Durum ve Acil Talep Badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border-2 min-w-[160px] justify-center ${statusColors[selectedRequest.U_TalepDurum]}`}
                >
                  {selectedRequest.U_TalepDurum}
                </span>
                {selectedRequest.U_AcilMi && (
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
                  <p className="text-lg font-bold text-gray-800 ml-8">{selectedRequest.Reqname}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏢</span>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>Departman</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 ml-8">{selectedRequest.items && selectedRequest.items.length > 0 ? selectedRequest.items[0].OcrCode : "-"}</p>
                </div>
                <div className={`rounded-xl shadow-md border-2 p-5 hover:shadow-lg transition-shadow ${
                  selectedRequest.U_AcilMi
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-100'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedRequest.U_AcilMi ? '⚠️' : '✅'}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      selectedRequest.U_AcilMi ? 'text-red-600' : 'text-green-600'
                    }`}>Aciliyet Durumu</span>
                  </div>
                  <p className={`text-lg font-bold ml-8 ${
                    selectedRequest.U_AcilMi ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {selectedRequest.U_AcilMi ? 'ACİL TALEP' : 'Normal'}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">📄 Belge Tarihi (TaxDate)</span>
                    <p className="text-lg font-bold text-gray-800">{formatDate(selectedRequest.TaxDate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>⏰ Gerekli Tarih (Reqdate)</span>
                    <p className="text-lg font-bold" style={{ color: "rgba(237, 124, 30)" }}>{formatDate(selectedRequest.Reqdate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">💾 Kayıt Tarihi (DocDate)</span>
                    <p className="text-lg font-bold text-gray-800">{formatDate(selectedRequest.DocDate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-700">✅ Geçerlilik Tarihi (DocDueDate)</span>
                    <p className="text-lg font-bold text-green-800">{formatDate(selectedRequest.DocDueDate)}</p>
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
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Kalem Kodu (ItemCode)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Kalem Tanımı (ItemName)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Departman (OcrCode)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Miktar (Quantity)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Birim (UomCode)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Satıcı (VendorCode)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Gerekli Tarih (PQTRegdate)</TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>Açıklama (FreeTxt)</TableHead>
                          <TableHead className="font-bold text-center" style={{ color: "rgba(237, 124, 30)" }}>Ek Dosya</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequest.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.isDummy && <span className="text-orange-600 mr-1" title="Dummy Kalem">🔸</span>}
                              {item.ItemCode}
                            </TableCell>
                            <TableCell>{item.ItemName}</TableCell>
                            <TableCell>{item.OcrCode}</TableCell>
                            <TableCell>{item.Quantity}</TableCell>
                            <TableCell>{item.UomCode}</TableCell>
                            <TableCell>{item.VendorCode || "-"}</TableCell>
                            <TableCell>{formatDate(item.PQTRegdate)}</TableCell>
                            <TableCell className="max-w-xs">
                              {item.FreeTxt ? (
                                <div className="text-sm text-gray-700">{item.FreeTxt}</div>
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
              {selectedRequest.Comments && (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6" style={{ borderLeft: "4px solid rgba(237, 124, 30, 1)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📝</span>
                    <span className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Açıklamalar ve Notlar (Comments)</span>
                  </div>
                  <div className="p-5 rounded-lg" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.05) 0%, rgba(237, 124, 30, 0.02) 100%)", border: "1px solid rgba(237, 124, 30, 0.1)" }}>
                    <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedRequest.Comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Satınalmacı ve Admin Butonları */}
          {selectedRequest && (currentUser?.role === "purchaser" || currentUser?.role === "admin") && (selectedRequest.U_TalepDurum === "Satınalmacıda" || selectedRequest.U_TalepDurum === "Satınalma Talebi") && (
            <DialogFooter className="gap-2">
              <Button
                onClick={handleRejectClick}
                variant="destructive"
                className="text-sm"
              >
                Reddet
              </Button>
              <Button
                onClick={handleReviseClick}
                variant="outline"
                className="text-sm"
              >
                Revize İste
              </Button>
            </DialogFooter>
          )}

          {/* Talep Sahibi - Revize Durumu Butonu */}
          {selectedRequest && currentUser?.role === "user" && selectedRequest.U_TalepDurum === "Revize İstendi" && selectedRequest.Reqname === currentUser?.name && (
            <DialogFooter className="gap-2">
              <Button
                onClick={handleEditAndResubmit}
                className="text-sm"
                style={{ backgroundColor: "rgba(237, 124, 30)" }}
              >
                Düzenle ve Tekrar Gönder
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Reddetme Dialog'u */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
              <span>❌</span>
              <span>Talebi Reddet</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-800">
                <strong>Doküman No:</strong> {selectedRequest?.documentNumber}
              </p>
              <p className="text-sm text-red-800">
                <strong>Talep Eden:</strong> {selectedRequest?.requester}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reddetme Sebebi <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Talebin neden reddedildiğini açıklayınız..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectReason("")
                setIsRejectDialogOpen(false)
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim()}
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revize Dialog'u */}
      <Dialog open={isReviseDialogOpen} onOpenChange={setIsReviseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: "rgba(237, 124, 30)" }}>
              <span>🔄</span>
              <span>Revize İste</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="border-l-4 p-4 rounded" style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", borderColor: "rgba(237, 124, 30)" }}>
              <p className="text-sm" style={{ color: "rgba(237, 124, 30)" }}>
                <strong>Doküman No:</strong> {selectedRequest?.documentNumber}
              </p>
              <p className="text-sm" style={{ color: "rgba(237, 124, 30)" }}>
                <strong>Talep Eden:</strong> {selectedRequest?.requester}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Revize Sebebi <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={reviseReason}
                onChange={(e) => setReviseReason(e.target.value)}
                placeholder="Hangi değişikliklerin yapılmasını istiyorsunuz?"
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviseReason("")
                setIsReviseDialogOpen(false)
              }}
            >
              İptal
            </Button>
            <Button
              onClick={handleReviseConfirm}
              disabled={!reviseReason.trim()}
              style={{ backgroundColor: "rgba(237, 124, 30)" }}
            >
              Revize İste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
