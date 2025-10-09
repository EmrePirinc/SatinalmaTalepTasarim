import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ItemSelectionDialog from "@/components/ItemSelectionDialog"
import SAPDateInput from "@/components/SAPDateInput"
import Sidebar from "@/components/Sidebar"
import {
  Bell,
  Filter,
  Plus,
  Search,
  Settings,
  User,
  Upload,
  List,
  Menu,
  LogOut,
  Trash2,
} from "lucide-react"

export default function TaskForm() {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [notes, setNotes] = useState("")
  const [documentNumber, setDocumentNumber] = useState("18691")
  const [documentDate, setDocumentDate] = useState(() => {
    const today = new Date()
    return `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
  })
  const [requiredDate, setRequiredDate] = useState("")
  const [validityDate, setValidityDate] = useState("")
  const [requestSummary, setRequestSummary] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isFirstRender = useRef(true)
  const previousRequiredDate = useRef("")

  // Başlık Gerekli Tarih değiştiğinde satırları güncelle
  useEffect(() => {
    // İlk render'da veya requiredDate değişmediyse kontrol etme
    if (isFirstRender.current || previousRequiredDate.current === requiredDate) {
      isFirstRender.current = false
      previousRequiredDate.current = requiredDate
      return
    }

    // requiredDate boşsa güncelleme
    if (!requiredDate) {
      previousRequiredDate.current = requiredDate
      return
    }

    // Dolu requiredDate'e sahip satırlar var mı kontrol et
    setTableRows((currentRows) => {
      const rowsWithDate = currentRows.filter((row) => row.requiredDate && row.requiredDate.trim() !== "")

      if (rowsWithDate.length > 0) {
        // Uyarı göster
        const shouldUpdate = window.confirm(
          "Mevcut tablo satırlarını gerekli yeni tarih ile güncellemek istiyor musunuz?",
        )

        if (shouldUpdate) {
          // Tüm satırları güncelle
          return currentRows.map((row) => ({ ...row, requiredDate }))
        }
        // Hayır denirse hiçbir şey yapma, yeni satırlar için requiredDate kullanılacak
        return currentRows
      } else {
        // Hiç dolu satır yoksa, tüm boş satırları güncelle
        return currentRows.map((row) => (row.requiredDate ? row : { ...row, requiredDate }))
      }
    })

    previousRequiredDate.current = requiredDate
  }, [requiredDate])

  useEffect(() => {
    // Kullanıcı kontrolü
    const user = localStorage.getItem("currentUser")
    if (!user) {
      navigate("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "user" && parsedUser.role !== "purchaser" && parsedUser.role !== "admin") {
      alert("Bu sayfaya erişim yetkiniz yok!")
      navigate("/login")
      return
    }

    setCurrentUser(parsedUser)
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate("/login")
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
      isDummy: false,
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

  const handleDeleteRow = (rowId: number) => {
    if (tableRows.length === 1) {
      alert("En az bir satır bulunmalıdır!")
      return
    }
    if (window.confirm("Bu satırı silmek istediğinize emin misiniz?")) {
      setTableRows(tableRows.filter((row) => row.id !== rowId))
    }
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
      if (filters.description && !row.description.toLowerCase().includes(filters.description.toLowerCase()))
        return false
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

    // Talebi oluştur - SAP'ye gönder
    const newRequest = {
      id: Date.now(),
      documentNumber,
      documentDate,
      requiredDate,
      validityDate,
      requester: currentUser?.name || "Selim Aksu",
      requesterRole: "Talep Açan",
      department: tableRows[0]?.departman || "Yönetim",
      createdDate: new Date().toLocaleDateString("tr-TR"),
      itemCount: tableRows.length,
      status: "Satınalma Talebi",
      isUrgent,
      requestSummary,
      items: tableRows,
      notes,
    }

    // localStorage'a kaydet
    const existingRequests = JSON.parse(localStorage.getItem("purchaseRequests") || "[]")
    existingRequests.push(newRequest)
    localStorage.setItem("purchaseRequests", JSON.stringify(existingRequests))

    alert("Satınalma talebi başarıyla oluşturuldu!")
    // Talep listesi sayfasına yönlendir
    navigate("/talep-listesi")
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
                  {currentUser?.role === "purchaser"
                    ? "Satınalmacı"
                    : currentUser?.role === "admin"
                      ? "Admin"
                      : "Talep Açan"}
                </span>
              </div>
              <Button onClick={handleLogout} variant="ghost" size="icon" className="w-8 h-8 ml-2" title="Çıkış Yap">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-2 md:p-4">
          <div className="w-full">
            <div className="bg-card rounded-lg border border-border shadow-sm p-4 md:p-6 mb-4 md:mb-6">
              <h3
                className="text-lg md:text-2xl font-bold mb-4 md:mb-6 pb-2 md:pb-3 border-b-2"
                style={{ color: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30, 0.2)" }}
              >
                Satınalma Talep Formu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Belge Tarihi <span className="text-red-500">*</span>
                  </label>
                  <SAPDateInput
                    value={documentDate}
                    onChange={(value) => setDocumentDate(value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Gerekli Tarih <span className="text-red-500">*</span>
                  </label>
                  <SAPDateInput
                    value={requiredDate}
                    onChange={(value) => setRequiredDate(value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Geçerlilik Tarihi
                  </label>
                  <SAPDateInput
                    value={validityDate}
                    onChange={(value) => setValidityDate(value)}
                    className="bg-background border-border text-foreground"
                  />
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
                <button
                  type="button"
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    isUrgent ? "bg-red-50 border-red-400 shadow-md" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          isUrgent ? "bg-red-500" : "bg-gray-300"
                        }`}
                      >
                        <span className="text-xl">⚠️</span>
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-base ${isUrgent ? "text-red-700" : "text-gray-700"}`}>
                          Acil Talep
                        </div>
                        <div className="text-xs text-gray-600">Bu talebin öncelikli olarak işlenmesi gerekiyor</div>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        isUrgent ? "bg-red-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          isUrgent ? "right-1" : "left-1"
                        }`}
                      ></div>
                    </div>
                  </div>
                </button>
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
                        requiredDate: requiredDate, // Başlıktaki gerekli tarihi kullan
                        quantity: "",
                        uomCode: "",
                        vendor: "",
                        description: "",
                        file: null as File | null,
                        isDummy: false,
                      }
                      setTableRows([...tableRows, newRow])
                    }}
                    style={{ backgroundColor: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30)" }}
                    className="hover:opacity-90 text-white text-xs md:text-sm font-medium px-3 md:px-4 py-2 h-9"
                  >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Yeni Satır</span>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <div className="border border-border rounded-lg overflow-hidden shadow-sm min-w-[1200px]">
                    {/* Filter Row */}
                    <div className="bg-white border-b border-border">
                      <div className="grid grid-cols-[180px_minmax(200px,1fr)_130px_80px_100px_120px_100px_150px_100px_60px]">
                        <div className="px-3 py-2 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <Input
                              placeholder="Filtrele..."
                              className="h-8 text-xs bg-muted border-border flex-1 min-w-0"
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
                              className="h-8 text-xs bg-muted border-border flex-1 min-w-0"
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
                              className="h-8 text-xs bg-muted border-border flex-1 min-w-0"
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
                              className="h-8 text-xs bg-muted border-border flex-1 min-w-0"
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
                              className="h-8 text-xs bg-muted border-border flex-1 min-w-0"
                              value={filters.description}
                              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="px-3 py-2 border-r border-border">
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
                        <div className="px-3 py-2"></div>
                      </div>
                    </div>

                    {/* Header Row */}
                    <div className="bg-[#ECF2FF] border-b border-border">
                      <div className="grid grid-cols-[180px_minmax(200px,1fr)_130px_80px_100px_120px_100px_150px_100px_60px]">
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
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">Ek Dosya</div>
                        <div className="px-3 py-3 text-sm font-medium text-[#181C14]">İşlemler</div>
                      </div>
                    </div>

                    {/* Data Rows */}
                    {filteredRows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[180px_minmax(200px,1fr)_130px_80px_100px_120px_100px_150px_100px_60px] border-b border-border bg-white hover:bg-muted/50 transition-colors"
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
                          <SAPDateInput
                            value={row.requiredDate}
                            onChange={(value) => handleRowFieldChange(row.id, "requiredDate", value)}
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
                        <div className="px-3 py-3 border-r border-border flex items-center justify-center">
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
                        <div className="px-3 py-3 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteRow(row.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
              <Button onClick={handleSubmit} className="text-sm" style={{ backgroundColor: "rgba(237, 124, 30)" }}>
                SAP'ye Gönder (Satınalma Talebi)
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
                  ? { ...row, itemCode: item.itemCode, itemName: item.itemName, isDummy: item.itemCode === "DUMMY" }
                  : row,
              ),
            )
          }
        }}
      />
    </div>
  )
}
