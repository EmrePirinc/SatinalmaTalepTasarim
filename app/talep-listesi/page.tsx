"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Home,
  Package,
  Bell,
  Calendar,
  Filter,
  Search,
  Settings,
  User,
  DollarSign,
  ChevronDown,
  Menu,
  X,
  Eye,
  LogOut,
  Info,
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

export default function TalepListesi() {
  const router = useRouter()
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
    createdDate: "",
    itemCount: "",
    status: "",
  })

  useEffect(() => {
    // Kullanıcı kontrolü
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    setCurrentUser(parsedUser)

    // localStorage'dan talepleri oku
    const savedRequests = localStorage.getItem("purchaseRequests")
    if (savedRequests) {
      let parsedRequests = JSON.parse(savedRequests)

      // Taslak kayıtları temizle (artık taslak süreci yok)
      parsedRequests = parsedRequests.filter((req: PurchaseRequest) => req.status !== "Taslak")

      // Temizlenmiş listeyi geri kaydet
      localStorage.setItem("purchaseRequests", JSON.stringify(parsedRequests))

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
  }, [router])

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
      if (filters.createdDate && !request.createdDate.includes(filters.createdDate)) return false
      if (filters.itemCount && request.itemCount.toString() !== filters.itemCount) return false
      if (filters.status && request.status !== filters.status) return false

      return true
    })
  }, [requests, searchQuery, filters])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
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

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={`${isSidebarOpen ? "w-52" : "w-0"} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
          <div className="text-base font-bold" style={{ color: "rgba(237, 124, 30)" }}>
            ANADOLU BAKIR
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4">
          <div className="px-4 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ANADOLU BAKIR</div>
          </div>

          <div className="space-y-1 px-2">
            <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
              <Home className="w-4 h-4" />
              <span className="text-xs">Anasayfa</span>
            </button>

            <button
              className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium"
              style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", color: "rgba(237, 124, 30)" }}
            >
              <Package className="w-4 h-4" />
              <span>Satınalma</span>
              <ChevronDown className="w-3 h-3 ml-auto" />
            </button>

            <div className="pl-6 space-y-1">
              <Link href="/">
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-xs">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                  Satınalma Talep Formu
                </button>
              </Link>
              <button
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-white text-xs font-medium"
                style={{ backgroundColor: "rgba(237, 124, 30)" }}
              >
                <div className="w-1 h-1 rounded-full bg-white" />
                Talep Listesi
              </button>
            </div>

            <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">Finans</span>
              <ChevronDown className="w-3 h-3 ml-auto" />
            </button>

            <div className="pl-6 space-y-1">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-xs">
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                Ödeme Süreci
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-accent"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <nav className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground hover:text-foreground cursor-pointer">Görev Listesi</span>
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
                  {currentUser?.role === "purchaser" ? "Satınalmacı" : "Admin"}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="w-8 h-8 ml-2"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-4">
          <div className="w-full">
            <div className="bg-card rounded-lg border border-border shadow-sm p-4">
              <h3
                className="text-2xl font-bold mb-6 pb-3 border-b-2"
                style={{ color: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30, 0.2)" }}
              >
                Satınalma Talep Listesi
              </h3>

              {/* Search */}
              <div className="relative mb-6">
                <Input
                  placeholder="Doküman numarası, talep eden veya departmana göre ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <div className="border border-border rounded-lg overflow-hidden shadow-sm">
                  {/* Filter Row */}
                  <div className="bg-white border-b border-border">
                    <div className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_90px_70px_130px_80px]">
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            placeholder="Filtrele..."
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.documentNumber}
                            onChange={(e) => setFilters({ ...filters, documentNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            placeholder="Filtrele..."
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.requestSummary}
                            onChange={(e) => setFilters({ ...filters, requestSummary: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            placeholder="Filtrele..."
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.requester}
                            onChange={(e) => setFilters({ ...filters, requester: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <select
                            className="h-8 text-xs bg-muted border border-border rounded-md px-2 flex-1"
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
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="date"
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.documentDate}
                            onChange={(e) => setFilters({ ...filters, documentDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="date"
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.requiredDate}
                            onChange={(e) => setFilters({ ...filters, requiredDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            placeholder="GG.AA.YYYY"
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.createdDate}
                            onChange={(e) => setFilters({ ...filters, createdDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <Input
                            type="number"
                            placeholder="Filtrele..."
                            className="h-8 text-xs bg-muted border-border"
                            value={filters.itemCount}
                            onChange={(e) => setFilters({ ...filters, itemCount: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="px-2 py-2 border-r border-border flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">⚠️</span>
                      </div>
                      <div className="px-3 py-2 border-r border-border">
                        <div className="flex items-center gap-1">
                          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <select
                            className="h-8 text-xs bg-muted border border-border rounded-md px-2 flex-1"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          >
                            <option value="">Tümü</option>
                            <option value="Satınalmacıda">Satınalmacıda</option>
                            <option value="Revize İstendi">Revize İstendi</option>
                            <option value="Reddedildi">Reddedildi</option>
                            <option value="Satınalma Teklifi">Satınalma Teklifi</option>
                            <option value="Satınalma Talebi">Satınalma Talebi</option>
                            <option value="Satınalma Siparişi">Satınalma Siparişi</option>
                            <option value="Mal Girişi">Mal Girişi</option>
                            <option value="Satıcı Faturası">Satıcı Faturası</option>
                            <option value="Ödeme Yapıldı">Ödeme Yapıldı</option>
                            <option value="İade">İade</option>
                            <option value="Tamamlandı">Tamamlandı</option>
                          </select>
                        </div>
                      </div>
                      <div className="px-3 py-2 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">İşlem</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Row */}
                  <div className="bg-[#ECF2FF] border-b border-border">
                    <div className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_90px_70px_130px_80px]">
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
                        Kayıt Tarihi
                      </div>
                      <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14] text-center">
                        Kalem Sayısı
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
                      className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_90px_70px_130px_80px] border-b border-border bg-white hover:bg-muted/50 transition-colors"
                    >
                      <div className="px-3 py-3 border-r border-border text-sm">{request.documentNumber}</div>
                      <div className="px-3 py-3 border-r border-border text-sm truncate">{request.requestSummary || "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.requester}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.department}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.documentDate || "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.requiredDate || "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.createdDate}</div>
                      <div className="px-3 py-3 border-r border-border text-sm text-center">{request.itemCount}</div>
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
                      <div className="px-2 py-2 flex items-center justify-center">
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
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Talep Detayları - {selectedRequest?.documentNumber}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              {/* Genel Bilgiler */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Talep Eden:</span>
                    <p className="text-sm font-semibold">{selectedRequest.requester}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Departman:</span>
                    <p className="text-sm font-semibold">{selectedRequest.department}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Durum:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[selectedRequest.status]}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                  {selectedRequest.isUrgent && (
                    <div className="col-span-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
                        <span>⚠️</span>
                        <span>ACİL TALEP</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Tarihler Bölümü */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold">Tarihler</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            <strong>Belge Tarihi:</strong> Talebin belge üzerindeki tarihi (kullanıcı tarafından belirlenir)<br />
                            <strong>Gerekli Tarih:</strong> Malzemenin ihtiyaç duyulduğu tarih<br />
                            <strong>Kayıt Tarihi:</strong> Talebin sisteme girildiği tarih (otomatik)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Belge Tarihi</span>
                      <p className="text-sm font-semibold">{selectedRequest.documentDate || "-"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Gerekli Tarih</span>
                      <p className="text-sm font-semibold">{selectedRequest.requiredDate || "-"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Kayıt Tarihi</span>
                      <p className="text-sm font-semibold">{selectedRequest.createdDate}</p>
                    </div>
                  </div>
                </div>
                {selectedRequest.requestSummary && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">Talep Özeti:</span>
                    <p className="text-sm font-semibold mt-1">{selectedRequest.requestSummary}</p>
                  </div>
                )}
              </div>

              {/* Kalem Listesi */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Kalem Listesi ({selectedRequest.items.length} kalem)</h4>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[#ECF2FF]">
                        <TableRow>
                          <TableHead className="text-[#181C14]">Kalem Kodu</TableHead>
                          <TableHead className="text-[#181C14]">Kalem Tanımı</TableHead>
                          <TableHead className="text-[#181C14]">Departman</TableHead>
                          <TableHead className="text-[#181C14]">Miktar</TableHead>
                          <TableHead className="text-[#181C14]">Birim</TableHead>
                          <TableHead className="text-[#181C14]">Satıcı</TableHead>
                          <TableHead className="text-[#181C14]">Gerekli Tarih</TableHead>
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
                            <TableCell>{item.requiredDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Notlar */}
              {selectedRequest.notes && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Açıklamalar</h4>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm">{selectedRequest.notes}</p>
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
