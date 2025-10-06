"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ItemSelectionDialog from "@/components/ItemSelectionDialog"
import {
  Home,
  Package,
  Bell,
  Calendar,
  Filter,
  Plus,
  ChevronDown,
  Search,
  Settings,
  User,
  DollarSign,
  Upload,
  List,
  Menu,
  X,
  LogOut,
} from "lucide-react"

export default function TaskForm() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [notes, setNotes] = useState("")
  const [documentNumber, setDocumentNumber] = useState("18691")
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0])
  const [requiredDate, setRequiredDate] = useState("")
  const [requestSummary, setRequestSummary] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    // Kullanıcı kontrolü
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "user" && parsedUser.role !== "purchaser") {
      alert("Bu sayfaya erişim yetkiniz yok!")
      router.push("/login")
      return
    }

    setCurrentUser(parsedUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const [filters, setFilters] = useState({
    departman: "",
    itemCode: "",
    itemName: "",
    requiredDate: "",
    quantity: "",
    uomCode: "",
    vendor: "",
    description: "",
    hasFile: "",
  })

  const [tableRows, setTableRows] = useState([
    {
      id: 1,
      departman: "",
      itemCode: "",
      itemName: "",
      requiredDate: "",
      quantity: "",
      uomCode: "",
      vendor: "",
      description: "",
      file: null as File | null,
    },
  ])

  const handleFileChange = (rowId: number, file: File | null) => {
    setTableRows(tableRows.map((row) => (row.id === rowId ? { ...row, file } : row)))
  }

  const handleDescriptionChange = (rowId: number, description: string) => {
    setTableRows(tableRows.map((row) => (row.id === rowId ? { ...row, description } : row)))
  }

  const handleRowFieldChange = (rowId: number, field: string, value: string) => {
    setTableRows(tableRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row)))
  }

  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (filters.itemCode && !row.itemCode.toLowerCase().includes(filters.itemCode.toLowerCase())) return false
      if (filters.itemName && !row.itemName.toLowerCase().includes(filters.itemName.toLowerCase())) return false
      if (filters.requiredDate && row.requiredDate !== filters.requiredDate) return false
      if (filters.quantity && !row.quantity.includes(filters.quantity)) return false
      if (filters.uomCode && row.uomCode !== filters.uomCode) return false
      if (filters.vendor && row.vendor !== filters.vendor) return false
      if (filters.departman && row.departman !== filters.departman) return false
      if (filters.description && !row.description.toLowerCase().includes(filters.description.toLowerCase())) return false
      if (filters.hasFile === "var" && !row.file) return false
      if (filters.hasFile === "yok" && row.file) return false
      return true
    })
  }, [tableRows, filters])

  const validateForm = () => {
    const errors: string[] = []

    // Gerekli Tarih kontrolü (üst form)
    if (!requiredDate) {
      errors.push("Gerekli Tarih alanı zorunludur")
    }

    // Satırları kontrol et
    tableRows.forEach((row, index) => {
      if (!row.itemCode) {
        errors.push(`${index + 1}. satır: Kalem Kodu zorunludur`)
      }
      if (!row.requiredDate) {
        errors.push(`${index + 1}. satır: Gerekli Tarih zorunludur`)
      }
      if (!row.quantity) {
        errors.push(`${index + 1}. satır: Miktar zorunludur`)
      }
      if (!row.uomCode) {
        errors.push(`${index + 1}. satır: Ölçü Birimi Kodu zorunludur`)
      }
      if (!row.departman) {
        errors.push(`${index + 1}. satır: Departman zorunludur`)
      }
    })

    return errors
  }

  const handleSubmit = () => {
    // Validasyon kontrolü
    const errors = validateForm()
    if (errors.length > 0) {
      alert("Lütfen zorunlu alanları doldurun:\n\n" + errors.join("\n"))
      return
    }

    // Talebi oluştur - Satınalmacıya gönder
    const newRequest = {
      id: Date.now(),
      documentNumber,
      documentDate,
      requester: currentUser?.name || "Selim Aksu",
      requesterRole: "Talep Açan",
      department: tableRows[0]?.departman || "Yönetim",
      createdDate: new Date().toLocaleDateString("tr-TR"),
      itemCount: tableRows.length,
      status: "Satınalmacıda",
      requestSummary,
      items: tableRows,
      notes,
    }

    // localStorage'a kaydet
    const existingRequests = JSON.parse(localStorage.getItem("purchaseRequests") || "[]")
    existingRequests.push(newRequest)
    localStorage.setItem("purchaseRequests", JSON.stringify(existingRequests))

    alert("Talep satınalmacıya gönderildi!")
    // Talep listesi sayfasına yönlendir
    router.push("/talep-listesi")
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <div className="text-xl font-bold" style={{ color: "rgba(237, 124, 30)" }}>
            ANADOLU BAKIR
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4">
          <div className="px-4 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">ANADOLU BAKIR</div>
          </div>

          <div className="space-y-1 px-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
              <Home className="w-5 h-5" />
              <span className="text-sm">Anasayfa</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium"
              style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", color: "rgba(237, 124, 30)" }}
            >
              <Package className="w-5 h-5" />
              <span>Satınalma</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </button>

            <div className="pl-8 space-y-1">
              <button
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium"
                style={{ backgroundColor: "rgba(237, 124, 30)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                Satınalma Talep Formu
              </button>
              <Link href="/talep-listesi">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Talep Listesi
                </button>
              </Link>
            </div>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">Finans</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </button>

            <div className="pl-8 space-y-1">
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                Ödeme Süreci
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
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
                  {currentUser?.role === "purchaser" ? "Satınalmacı" : "Talep Açan"}
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
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6 mb-6">
              <h3
                className="text-2xl font-bold mb-6 pb-3 border-b-2"
                style={{ color: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30, 0.2)" }}
              >
                Satınalma Talep Formu
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Doküman Numarası</label>
                  <Input
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Talep Eden Kullanıcı ID</label>
                  <Input value="Selim.aksu" readOnly className="bg-muted border-border text-foreground" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Talep Eden Adı Soyadı</label>
                  <Input value="Selim Aksu" readOnly className="bg-muted border-border text-foreground" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">Belge Tarihi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={documentDate}
                      onChange={(e) => setDocumentDate(e.target.value)}
                      className="bg-background border-border text-foreground pr-10"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Gerekli Tarih <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-card-foreground mb-2 block">Talep Özeti</label>
                <Input
                  value={requestSummary}
                  onChange={(e) => setRequestSummary(e.target.value)}
                  placeholder="Talep özetini giriniz..."
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-card-foreground mb-2 block">Satırlar</label>

                <div className="relative mb-3">
                  <Input
                    placeholder="Arama"
                    className="bg-muted border-border text-foreground pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>

                <div className="mb-3">
                  <Button
                    onClick={() => {
                      const newRow = {
                        id: tableRows.length + 1,
                        departman: "",
                        itemCode: "",
                        itemName: "",
                        requiredDate: "",
                        quantity: "",
                        uomCode: "",
                        vendor: "",
                        description: "",
                        file: null as File | null,
                      }
                      setTableRows([...tableRows, newRow])
                    }}
                    style={{ backgroundColor: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30)" }}
                    className="hover:opacity-90 text-white text-sm font-medium px-4 py-2 h-9"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Satır
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <div className="border border-border rounded-lg overflow-hidden shadow-sm">
                    {/* Filter Row */}
                    <div className="bg-white border-b border-border">
                      <div className="grid grid-cols-[180px_minmax(200px,1fr)_130px_80px_100px_120px_100px_150px_100px]">
                        <div className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <Input
                              placeholder="Filtrele..."
                              className="h-8 text-xs bg-muted border-border"
                              value={filters.itemCode}
                              onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <Input
                              placeholder="Filtrele..."
                              className="h-8 text-xs bg-muted border-border"
                              value={filters.itemName}
                              onChange={(e) => setFilters({ ...filters, itemName: e.target.value })}
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
                              placeholder="Filtrele..."
                              className="h-8 text-xs bg-muted border-border"
                              value={filters.quantity}
                              onChange={(e) => setFilters({ ...filters, quantity: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <select
                              className="h-8 text-xs bg-muted border border-border rounded-md px-2 flex-1"
                              value={filters.uomCode}
                              onChange={(e) => setFilters({ ...filters, uomCode: e.target.value })}
                            >
                              <option value="">Tümü</option>
                              <option value="AD">AD</option>
                              <option value="KG">KG</option>
                              <option value="LT">LT</option>
                              <option value="MT">MT</option>
                              <option value="M2">M2</option>
                              <option value="M3">M3</option>
                            </select>
                          </div>
                        </div>
                        <div className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <select
                              className="h-8 text-xs bg-muted border border-border rounded-md px-2 flex-1"
                              value={filters.vendor}
                              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
                            >
                              <option value="">Tümü</option>
                              <option value="Satıcı A">Satıcı A</option>
                              <option value="Satıcı B">Satıcı B</option>
                              <option value="Satıcı C">Satıcı C</option>
                            </select>
                          </div>
                        </div>
                        <div className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <select
                              className="h-8 text-xs bg-muted border border-border rounded-md px-2 flex-1"
                              value={filters.departman}
                              onChange={(e) => setFilters({ ...filters, departman: e.target.value })}
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
                              placeholder="Filtrele..."
                              className="h-8 text-xs bg-muted border-border"
                              value={filters.description}
                              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="px-3 py-2">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <select
                              className="h-8 text-xs bg-muted border border-border rounded-md px-2 flex-1"
                              value={filters.hasFile}
                              onChange={(e) => setFilters({ ...filters, hasFile: e.target.value })}
                            >
                              <option value="">Tümü</option>
                              <option value="var">Var</option>
                              <option value="yok">Yok</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Header Row */}
                    <div className="bg-[#ECF2FF] border-b border-border">
                      <div className="grid grid-cols-[180px_minmax(200px,1fr)_130px_80px_100px_120px_100px_150px_100px]">
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Kalem Kodu <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Kalem Tanımı
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Gerekli Tarih <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Miktar <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Ölçü Birimi Kodu <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Satıcı
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Departman <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Açıklama
                        </div>
                        <div className="px-3 py-3 text-sm font-medium text-[#181C14]">Ek Dosya</div>
                      </div>
                    </div>

                    {/* Data Rows */}
                    {filteredRows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[180px_minmax(200px,1fr)_130px_80px_100px_120px_100px_150px_100px] border-b border-border bg-white hover:bg-muted/50 transition-colors"
                      >
                        <div className="px-3 py-3 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Input
                              value={row.itemCode}
                              onChange={(e) => handleRowFieldChange(row.id, "itemCode", e.target.value)}
                              placeholder="Kalem kodu..."
                              className="h-8 text-xs bg-background border-border flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedRowId(row.id)
                                setIsDialogOpen(true)
                              }}
                            >
                              <List className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Input
                              value={row.itemName}
                              onChange={(e) => handleRowFieldChange(row.id, "itemName", e.target.value)}
                              placeholder="Kalem tanımı..."
                              className="h-8 text-xs bg-background border-border flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedRowId(row.id)
                                setIsDialogOpen(true)
                              }}
                            >
                              <List className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <Input
                            type="date"
                            value={row.requiredDate}
                            onChange={(e) => handleRowFieldChange(row.id, "requiredDate", e.target.value)}
                            className="h-8 text-xs bg-background border-border"
                          />
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <Input
                            type="number"
                            value={row.quantity}
                            onChange={(e) => handleRowFieldChange(row.id, "quantity", e.target.value)}
                            placeholder="Miktar..."
                            className="h-8 text-xs bg-background border-border"
                          />
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <select
                            value={row.uomCode}
                            onChange={(e) => handleRowFieldChange(row.id, "uomCode", e.target.value)}
                            className="h-8 text-xs bg-background border border-border rounded-md px-2 w-full"
                          >
                            <option value="">Seçiniz</option>
                            <option value="AD">AD</option>
                            <option value="KG">KG</option>
                            <option value="LT">LT</option>
                            <option value="MT">MT</option>
                            <option value="M2">M2</option>
                            <option value="M3">M3</option>
                          </select>
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <select
                            value={row.vendor}
                            onChange={(e) => handleRowFieldChange(row.id, "vendor", e.target.value)}
                            className="h-8 text-xs bg-background border border-border rounded-md px-2 w-full"
                          >
                            <option value="">Seçiniz</option>
                            <option value="Satıcı A">Satıcı A</option>
                            <option value="Satıcı B">Satıcı B</option>
                            <option value="Satıcı C">Satıcı C</option>
                          </select>
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <select
                            value={row.departman}
                            onChange={(e) => handleRowFieldChange(row.id, "departman", e.target.value)}
                            className="h-8 text-xs bg-background border border-border rounded-md px-2 w-full"
                          >
                            <option value="">Seçiniz</option>
                            <option value="Konsol">Konsol</option>
                            <option value="Bakır">Bakır</option>
                            <option value="İzole">İzole</option>
                            <option value="Yönetim">Yönetim</option>
                            <option value="Bakımhane">Bakımhane</option>
                            <option value="Depo">Depo</option>
                          </select>
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <Input
                            value={row.description}
                            onChange={(e) => handleDescriptionChange(row.id, e.target.value)}
                            placeholder="Açıklama giriniz..."
                            className="h-8 text-xs bg-background border-border truncate"
                          />
                        </div>
                        <div className="px-3 py-3 flex items-center justify-center">
                          <label
                            className="cursor-pointer flex items-center gap-1 text-xs hover:opacity-80"
                            style={{ color: "rgba(237, 124, 30)" }}
                          >
                            <Upload className="w-4 h-4" />
                            <span>{row.file ? row.file.name : "Dosya Seç"}</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null
                                handleFileChange(row.id, file)
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ))}

                    {/* Footer */}
                    <div className="px-4 py-3 text-sm text-muted-foreground flex justify-end bg-muted/30">
                      <span>Toplam {filteredRows.length} öğe var</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-card-foreground mb-2 block">Açıklamalar</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ek notlar giriniz..."
                  className="bg-muted border-border text-foreground min-h-[100px]"
                />
              </div>

            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={handleSubmit}
                className="text-sm"
                style={{ backgroundColor: "rgba(237, 124, 30)" }}
              >
                Satınalmacıya Gönder
              </Button>
            </div>
          </div>
        </main>
      </div>
      <ItemSelectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onItemSelected={(item) => {
          if (selectedRowId !== null) {
            setTableRows((currentRows) =>
              currentRows.map((row) =>
                row.id === selectedRowId
                  ? { ...row, itemCode: item.itemCode, itemName: item.itemName }
                  : row
              )
            )
          }
        }}
      />
    </div>
  )
}
