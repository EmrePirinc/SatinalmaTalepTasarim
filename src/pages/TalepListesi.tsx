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
  Filter,
  Search,
  Settings,
  User,
  Menu,
  LogOut,
  Info,
  ChevronDown,
} from "lucide-react"

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
  const [filterAssigned, setFilterAssigned] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

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

      // Atanan filtresi
      if (filterAssigned === "mine") {
        if (currentUser?.role !== "purchaser") return false
        if (request.status !== "Satınalmacıda" && request.status !== "Satınalma Talebi") return false
      }

      // Durum filtresi
      if (filterStatus !== "all" && request.status !== filterStatus) return false

      return true
    })
  }, [requests, searchQuery, filterAssigned, filterStatus, currentUser])

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
      req.id === selectedRequest.id
        ? {
            ...req,
            status: "Reddedildi" as RequestStatus,
            notes: (req.notes || "") + "\n\nRed Sebebi: " + reason,
          }
        : req
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
      req.id === selectedRequest.id
        ? {
            ...req,
            status: "Revize İstendi" as RequestStatus,
            notes: (req.notes || "") + "\n\nRevize Notu: " + revisionNote,
          }
        : req
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
        ? {
            ...req,
            status: "Satınalma Talebi" as RequestStatus,
            notes:
              (req.notes || "") +
              "\n\n[Revize sonrası tekrar gönderildi: " +
              new Date().toLocaleDateString("tr-TR") +
              "]",
          }
        : req
    )
    setRequests(updatedRequests)
    localStorage.setItem("purchaseRequests", JSON.stringify(updatedRequests))
    alert("Talep güncellenerek tekrar gönderildi!")
    setIsDetailDialogOpen(false)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <nav className="flex items-center gap-6 text-sm">
              <span className="font-semibold" style={{ color: "rgba(237, 124, 30)" }}>
                Görev Listesi
              </span>
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Anasayfa</span>
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Ayarlar</span>
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Yardım</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2 border-l pl-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(237, 124, 30) 0%, rgba(200, 100, 20) 100%)" }}
              >
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium">{currentUser?.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentUser?.role === "purchaser"
                    ? "Satınalmacı"
                    : currentUser?.role === "user"
                      ? "Talep Açan"
                      : "Admin"}
                </span>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="w-8 h-8 ml-2" title="Çıkış Yap">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Üst Filtreler ve Arama */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Filtreler */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Atanan:</span>
                    <div className="relative">
                      <select
                        value={filterAssigned}
                        onChange={(e) => setFilterAssigned(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="all">Hepsi</option>
                        <option value="mine">Bana Atananlar</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Durum:</span>
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="all">Tüm Süreçler</option>
                        <option value="Satınalma Talebi">Satınalma Talebi</option>
                        <option value="Satınalmacıda">Satınalmacıda</option>
                        <option value="Revize İstendi">Revize İstendi</option>
                        <option value="Reddedildi">Reddedildi</option>
                        <option value="Satınalma Teklifi">Satınalma Teklifi</option>
                        <option value="Satınalma Siparişi">Satınalma Siparişi</option>
                        <option value="Mal Girişi">Mal Girişi</option>
                        <option value="Tamamlandı">Tamamlandı</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Arama */}
                <div className="flex-1 relative">
                  <Input
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Görev Listesi */}
            <div className="mb-4 text-lg font-semibold text-gray-700">
              Görev Listesi
            </div>

            {/* Talep Kartları */}
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">Gösterilecek talep bulunamadı.</p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewDetails(request)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        {/* Sol Taraf - Ana İçerik */}
                        <div className="flex-1 min-w-0">
                          {/* Başlık ve Numara */}
                          <div className="flex items-start gap-3 mb-2">
                            {/* Acil İkonu */}
                            {request.isUrgent && (
                              <div
                                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white shadow-md"
                                title="Acil Talep"
                              >
                                ⚠️
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-bold text-gray-900 mb-1">
                                Satınalma Süreci - Talep Onay Formu
                              </h3>
                              <p className="text-sm text-gray-600">
                                {request.documentNumber} numaralı ve{" "}
                                {formatDate(request.documentDate)} tarihli{" "}
                                {request.requestSummary || "Platform lazer kesim konulu talep"}
                              </p>
                            </div>
                          </div>

                          {/* Alt Bilgiler */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Başlatan:</span>
                              <span className="text-blue-600">{request.requester}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Atanan:</span>
                              <span className="text-blue-600">
                                {request.status === "Satınalmacıda" || request.status === "Satınalma Talebi"
                                  ? "Satınalma"
                                  : request.department}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Sağ Taraf - Durum ve Tarih */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[request.status]}`}
                          >
                            {request.status === "Satınalma Talebi" ? "Talep onayı: bekleniyor" : request.status}
                          </span>
                          <div className="text-xs text-gray-500">
                            {formatDate(request.createdDate)}/{formatDate(request.requiredDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alt Çizgi - Vurgu Çubuğu */}
                    <div
                      className="h-1 rounded-b-lg"
                      style={{
                        background:
                          request.status === "Reddedildi"
                            ? "linear-gradient(to right, #ef4444, #dc2626)"
                            : request.status === "Revize İstendi"
                              ? "linear-gradient(to right, #f97316, #ea580c)"
                              : "linear-gradient(to right, rgba(237, 124, 30), rgba(200, 100, 20))",
                      }}
                    />
                  </div>
                ))
              )}
            </div>

            {/* Toplam Sayısı */}
            {filteredRequests.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                Toplam {filteredRequests.length} talep gösteriliyor
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detay Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-[98vw] md:max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader className="border-b-2 pb-4" style={{ borderColor: "rgba(237, 124, 30, 0.2)" }}>
            <DialogTitle
              className="flex items-center gap-2 text-xl md:text-2xl font-bold"
              style={{ color: "rgba(237, 124, 30)" }}
            >
              <span>📋 Doküman No: {selectedRequest?.documentNumber}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6 pt-4">
              {/* Talep Özeti - Başlık */}
              {selectedRequest.requestSummary && (
                <div
                  className="relative overflow-hidden rounded-xl shadow-md p-6"
                  style={{
                    background: "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)",
                    borderLeft: "4px solid rgba(237, 124, 30, 1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>
                      📝 Talep Özeti
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                    {selectedRequest.requestSummary}
                  </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👤</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "rgba(237, 124, 30)" }}
                    >
                      Talep Eden
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 ml-8">{selectedRequest.requester}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏢</span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "rgba(237, 124, 30)" }}
                    >
                      Departman
                    </span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 ml-8">{selectedRequest.department}</p>
                </div>
              </div>

              {/* Tarihler Bölümü */}
              <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Calendar className="w-6 h-6" style={{ color: "rgba(237, 124, 30)" }} />
                  <span
                    className="text-lg font-bold uppercase tracking-wide"
                    style={{ color: "rgba(237, 124, 30)" }}
                  >
                    Tarihler
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-gray-900 text-white p-4 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          <strong>📄 Belge Tarihi:</strong> Talebin belge üzerindeki tarihi
                          <br />
                          <strong>⏰ Gerekli Tarih:</strong> Malzemenin ihtiyaç duyulduğu tarih
                          <br />
                          <strong>💾 Kayıt Tarihi:</strong> Talebin sisteme girildiği tarih
                          <br />
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
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "rgba(237, 124, 30)" }}
                    >
                      ⏰ Gerekli Tarih
                    </span>
                    <p className="text-lg font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                      {formatDate(selectedRequest.requiredDate)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">💾 Kayıt Tarihi</span>
                    <p className="text-lg font-bold text-gray-800">{formatDate(selectedRequest.createdDate)}</p>
                  </div>
                  <div className="flex flex-col gap-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-green-700">
                      ✅ Geçerlilik Tarihi
                    </span>
                    <p className="text-lg font-bold text-green-800">
                      {formatDate(selectedRequest.validityDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Kalem Listesi */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <Package className="w-6 h-6" style={{ color: "rgba(237, 124, 30)" }} />
                    <h4
                      className="text-lg font-bold uppercase tracking-wide"
                      style={{ color: "rgba(237, 124, 30)" }}
                    >
                      Kalem Listesi
                    </h4>
                    <span
                      className="px-4 py-1.5 rounded-full text-sm font-bold uppercase shadow-sm"
                      style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", color: "rgba(237, 124, 30)" }}
                    >
                      {selectedRequest.items.length} Kalem
                    </span>
                  </div>
                  <div
                    className="border-2 rounded-lg overflow-hidden shadow-sm"
                    style={{ borderColor: "rgba(237, 124, 30, 0.2)" }}
                  >
                    <Table>
                      <TableHeader
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)",
                        }}
                      >
                        <TableRow>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Kalem Kodu
                          </TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Kalem Tanımı
                          </TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Departman
                          </TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Miktar
                          </TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Birim
                          </TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Satıcı
                          </TableHead>
                          <TableHead className="font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                            Gerekli Tarih
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequest.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.isDummy && (
                                <span className="text-orange-600 mr-1" title="Dummy Kalem">
                                  🔸
                                </span>
                              )}
                              {item.itemCode}
                            </TableCell>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.departman}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.uomCode}</TableCell>
                            <TableCell>{item.vendor || "-"}</TableCell>
                            <TableCell>{formatDate(item.requiredDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Notlar */}
              {selectedRequest.notes && (
                <div
                  className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-6"
                  style={{ borderLeft: "4px solid rgba(237, 124, 30, 1)" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📝</span>
                    <span
                      className="text-lg font-bold uppercase tracking-wide"
                      style={{ color: "rgba(237, 124, 30)" }}
                    >
                      Açıklamalar ve Notlar
                    </span>
                  </div>
                  <div
                    className="p-5 rounded-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(237, 124, 30, 0.05) 0%, rgba(237, 124, 30, 0.02) 100%)",
                      border: "1px solid rgba(237, 124, 30, 0.1)",
                    }}
                  >
                    <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {selectedRequest.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Satınalmacı Butonları */}
          {selectedRequest &&
            currentUser?.role === "purchaser" &&
            (selectedRequest.status === "Satınalmacıda" || selectedRequest.status === "Satınalma Talebi") && (
              <DialogFooter className="gap-2">
                <Button onClick={handleReject} variant="destructive" className="text-sm">
                  Reddet
                </Button>
                <Button onClick={handleRevise} variant="outline" className="text-sm">
                  Revize İste
                </Button>
              </DialogFooter>
            )}

          {/* Talep Sahibi - Revize Durumu Butonu */}
          {selectedRequest &&
            currentUser?.role === "user" &&
            selectedRequest.status === "Revize İstendi" &&
            selectedRequest.requester === currentUser?.name && (
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
