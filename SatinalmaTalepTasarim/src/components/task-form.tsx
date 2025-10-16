import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ItemSelectionDialog from "@/components/ItemSelectionDialog"
import VendorSelectionDialog from "@/components/VendorSelectionDialog"
import SAPDateInput from "@/components/SAPDateInput"
import Sidebar from "@/components/Sidebar"
import { requestsAPI } from "@/services/api"
import {
  Bell,
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
  const location = useLocation()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  // SAP OPRQ Header Fields
  const [docNum, setDocNum] = useState("")
  const [taxDate, setTaxDate] = useState(() => {
    const today = new Date()
    return `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
  })
  const [reqdate, setReqdate] = useState("")
  const [docDueDate, setDocDueDate] = useState("")
  const [uTalepOzeti, setUTalepOzeti] = useState("")
  const [uAcilMi, setUAcilMi] = useState(false)
  const [comments, setComments] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false)
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const isFirstRender = useRef(true)
  const previousReqdate = useRef("")

  // Başlık Gerekli Tarih (Reqdate) değiştiğinde satırları güncelle
  useEffect(() => {
    // İlk render'da veya reqdate değişmediyse kontrol etme
    if (isFirstRender.current || previousReqdate.current === reqdate) {
      isFirstRender.current = false
      previousReqdate.current = reqdate
      return
    }

    // reqdate boşsa güncelleme
    if (!reqdate) {
      previousReqdate.current = reqdate
      return
    }

    // Dolu PQTRegdate'e sahip satırlar var mı kontrol et
    setTableRows((currentRows) => {
      const rowsWithDate = currentRows.filter((row) => row.PQTRegdate && row.PQTRegdate.trim() !== "")

      if (rowsWithDate.length > 0) {
        // Uyarı göster
        const shouldUpdate = window.confirm(
          "Mevcut tablo satırlarını gerekli yeni tarih ile güncellemek istiyor musunuz?",
        )

        if (shouldUpdate) {
          // Tüm satırları güncelle
          return currentRows.map((row) => ({ ...row, PQTRegdate: reqdate }))
        }
        // Hayır denirse hiçbir şey yapma, yeni satırlar için reqdate kullanılacak
        return currentRows
      } else {
        // Hiç dolu satır yoksa, tüm boş satırları güncelle
        return currentRows.map((row) => (row.PQTRegdate ? row : { ...row, PQTRegdate: reqdate }))
      }
    })

    previousReqdate.current = reqdate
  }, [reqdate])

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
        
        // Yetkisiz kullanıcıları engelle
        if (!["user", "purchaser", "admin"].includes(user.role)) {
          alert("Bu sayfaya erişim yetkiniz yok!")
          navigate("/login")
          return
        }

        setCurrentUser(user)
      } catch (error) {
        console.error('User fetch error:', error)
        localStorage.removeItem("userId")
        localStorage.removeItem("userRole")
        navigate("/login")
        return
      }
    }

    fetchCurrentUser()

    // DocNum API'den al (düzenleme modunda değilse)
    const editingRequest = location.state?.editingRequest
    if (!editingRequest) {
      requestsAPI.getNextDocNumber()
        .then(response => {
          setDocNum(response.nextDocNumber)
        })
        .catch(error => {
          console.error("DocNum alınamadı:", error)
          setDocNum("AUTO") // Fallback
        })
    }

    // Düzenleme modunu kontrol et
    if (editingRequest) {
      // Edit mode'u aktifleştir
      setIsEditMode(true)
      setEditingRequestId(editingRequest.id)

      // Tarih formatlarını DD/MM/YYYY'ye çevir
      const formatToSAPDate = (dateStr: string | undefined): string => {
        if (!dateStr) return ""
        if (dateStr.includes("-")) {
          const [year, month, day] = dateStr.split("-")
          return `${day}/${month}/${year}`
        }
        if (dateStr.includes(".")) {
          return dateStr.replace(/\./g, "/")
        }
        return dateStr
      }

      // Formu doldur - SAP fields
      setDocNum(editingRequest.DocNum || "")
      setTaxDate(formatToSAPDate(editingRequest.TaxDate))
      setReqdate(formatToSAPDate(editingRequest.Reqdate))
      setDocDueDate(formatToSAPDate(editingRequest.DocDueDate))
      setUTalepOzeti(editingRequest.U_TalepOzeti || "")
      setUAcilMi(editingRequest.U_AcilMi || false)
      setComments(editingRequest.Comments || "")

      // Satırları doldur - SAP fields
      if (editingRequest.items && editingRequest.items.length > 0) {
        const formattedItems = editingRequest.items.map((item: any, index: number) => ({
          id: index + 1,
          OcrCode: item.OcrCode || "",
          ItemCode: item.ItemCode || "",
          ItemName: item.ItemName || "",
          PQTRegdate: formatToSAPDate(item.PQTRegdate),
          Quantity: item.Quantity || "",
          UomCode: item.UomCode || "",
          VendorCode: item.VendorCode || "",
          FreeTxt: item.FreeTxt || "",
          file: null,
          isDummy: item.isDummy || false,
        }))
        setTableRows(formattedItems)
      }
    }
  }, [navigate, location.state])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userRole")
    navigate("/login")
  }

  // SAP PRQ1 Line Fields için filtreler
  const [filters, setFilters] = useState({
    OcrCode: "",
    ItemCode: "",
    ItemName: "",
    PQTRegdate: "",
    Quantity: "",
    UomCode: "",
    VendorCode: "",
    FreeTxt: "",
    hasFile: "",
  })

  // SAP PRQ1 Line Fields için table rows
  const [tableRows, setTableRows] = useState([
    {
      id: 1,
      OcrCode: "", // PRQ1.OcrCode (Departman)
      ItemCode: "", // OITM.ItemCode
      ItemName: "", // OITM.ItemName
      PQTRegdate: "", // PRQ1.PQTRegdate (Gerekli Tarih)
      Quantity: "", // PRQ1.Quantity
      UomCode: "", // PRQ1.UomCode
      VendorCode: "", // PRQ1.VendorCode
      FreeTxt: "", // PRQ1.FreeTxt (Açıklama)
      file: null as File | null,
      isDummy: false,
    },
  ])

  const handleFileChange = (rowId: number, file: File | null) => {
    setTableRows(tableRows.map((row) => (row.id === rowId ? { ...row, file } : row)))
  }

  const handleDescriptionChange = (rowId: number, FreeTxt: string) => {
    setTableRows(tableRows.map((row) => (row.id === rowId ? { ...row, FreeTxt } : row)))
  }

  const handleRowFieldChange = (rowId: number, field: string, value: string) => {
    // Kalem Tanımı (ItemName) salt okunur olduğu için bu alanı değiştirmeyi engelle
    if (field === "ItemName") {
      return
    }
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
      if (filters.ItemCode && !row.ItemCode.toLowerCase().includes(filters.ItemCode.toLowerCase())) return false
      if (filters.ItemName && !row.ItemName.toLowerCase().includes(filters.ItemName.toLowerCase())) return false
      if (filters.PQTRegdate && row.PQTRegdate !== filters.PQTRegdate) return false
      if (filters.Quantity && !row.Quantity.includes(filters.Quantity)) return false
      if (filters.UomCode && row.UomCode !== filters.UomCode) return false
      if (filters.VendorCode && row.VendorCode !== filters.VendorCode) return false
      if (filters.OcrCode && row.OcrCode !== filters.OcrCode) return false
      if (filters.FreeTxt && !row.FreeTxt.toLowerCase().includes(filters.FreeTxt.toLowerCase()))
        return false
      if (filters.hasFile === "var" && !row.file) return false
      if (filters.hasFile === "yok" && row.file) return false
      return true
    })
  }, [tableRows, filters])

  const validateForm = () => {
    const errors: string[] = []

    // OPRQ Header zorunlu alanları
    if (!taxDate) {
      errors.push("Belge Tarihi alanı zorunludur")
    }
    if (!reqdate) {
      errors.push("Gerekli Tarih alanı zorunludur")
    }
    if (!docDueDate) {
      errors.push("Geçerlilik Tarihi alanı zorunludur")
    }
    if (!uTalepOzeti || !uTalepOzeti.trim()) {
      errors.push("Talep Özeti alanı zorunludur")
    }

    // İş Kuralı: Gerekli Tarih > Belge Tarihi
    if (taxDate && reqdate) {
      const parseTaxDate = (dateStr: string) => {
        const [day, month, year] = dateStr.split('/')
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }

      try {
        const belgeDate = parseTaxDate(taxDate)
        const gerekliDate = parseTaxDate(reqdate)

        if (gerekliDate <= belgeDate) {
          errors.push("Gerekli Tarih, Belge Tarihinden ileri bir tarih olmalıdır")
        }
      } catch (e) {
        errors.push("Tarih formatı hatalı (DD/MM/YYYY formatında olmalı)")
      }
    }

    // PRQ1 Lines zorunlu alanları
    tableRows.forEach((row, index) => {
      if (!row.ItemCode) {
        errors.push(`${index + 1}. satır: Kalem Kodu zorunludur`)
      }
      if (!row.ItemName) {
        errors.push(`${index + 1}. satır: Kalem Tanımı zorunludur`)
      }
      if (!row.PQTRegdate) {
        errors.push(`${index + 1}. satır: Gerekli Tarih zorunludur`)
      }
      if (!row.Quantity) {
        errors.push(`${index + 1}. satır: Miktar zorunludur`)
      } else {
        // İş Kuralı: Miktar > 0
        const quantity = parseFloat(row.Quantity)
        if (isNaN(quantity) || quantity <= 0) {
          errors.push(`${index + 1}. satır: Miktar 0'dan büyük bir sayı olmalıdır`)
        }
      }
      if (!row.UomCode) {
        errors.push(`${index + 1}. satır: Ölçü Birimi Kodu zorunludur`)
      }
      if (!row.OcrCode) {
        errors.push(`${index + 1}. satır: Departman zorunludur`)
      }
    })

    // İş Kuralı: En az 1 satır olmalı
    if (tableRows.length === 0) {
      errors.push("En az 1 kalem satırı eklemelisiniz")
    }

    return errors
  }

  const handleSubmit = async () => {
    // Validasyon kontrolü
    const errors = validateForm()
    if (errors.length > 0) {
      alert("Lütfen zorunlu alanları doldurun:\n\n" + errors.join("\n"))
      return
    }

    try {
      // SAP formatında request data hazırla
      const requestData = {
        // OPRQ Header Fields
        DocNum: docNum,
        TaxDate: taxDate,
        Reqdate: reqdate,
        DocDueDate: docDueDate,
        DocDate: taxDate, // Kayıt tarihi = Belge Tarihi
        Reqname: currentUser?.name || "",
        U_TalepOzeti: uTalepOzeti,
        U_AcilMi: uAcilMi,
        Comments: comments,
        
        // PRQ1 Line Items
        items: tableRows.map(row => ({
          OcrCode: row.OcrCode,
          ItemCode: row.ItemCode,
          ItemName: row.ItemName,
          PQTRegdate: row.PQTRegdate,
          Quantity: row.Quantity,
          UomCode: row.UomCode,
          VendorCode: row.VendorCode,
          FreeTxt: row.FreeTxt,
          isDummy: row.isDummy,
        }))
      }

      if (isEditMode && editingRequestId) {
        // Düzenleme modu - mevcut talebi güncelle
        const response = await requestsAPI.update(editingRequestId, requestData)
        if (response.success) {
          alert("Talep başarıyla güncellendi ve tekrar gönderildi!")
          navigate("/talep-listesi")
        }
      } else {
        // Yeni talep oluştur
        const response = await requestsAPI.create(requestData)
        if (response.success) {
          alert("Satınalma talebi başarıyla oluşturuldu!")
          navigate("/talep-listesi")
        }
      }
    } catch (error: any) {
      console.error("Submit hatası:", error)
      alert("İşlem sırasında hata oluştu: " + (error.message || "Bilinmeyen hata"))
    }
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
              <h1 className="text-base font-semibold text-gray-800">Satınalma Talep Formu</h1>
              <span className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{isEditMode ? "Talebi Düzenle" : "Yeni Talep"}</span>
              </span>
              {isEditMode && (
                <span className="px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: "rgba(237, 124, 30)" }}>
                  Düzenleniyor
                </span>
              )}
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
                    {currentUser?.role === "purchaser"
                      ? "Satınalmacı"
                      : currentUser?.role === "admin"
                        ? "Admin"
                        : "Talep Açan"}
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
            <div className="bg-card rounded-lg border border-border shadow-sm p-4 md:p-6 mb-4 md:mb-6">
              <h3
                className="text-lg md:text-2xl font-bold mb-4 md:mb-6 pb-2 md:pb-3 border-b-2"
                style={{ color: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30, 0.2)" }}
              >
                Satınalma Talep Formu
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Doküman No (OPRQ.DocNum) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={docNum}
                    readOnly
                    className="bg-muted border-border text-foreground cursor-not-allowed"
                    title="SAP tarafından otomatik atanır"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Talep Eden (OPRQ.Reqname) <span className="text-red-500">*</span>
                  </label>
                  <Input value={currentUser?.name || ""} readOnly className="bg-muted border-border text-foreground cursor-not-allowed" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Belge Tarihi (OPRQ.TaxDate) <span className="text-red-500">*</span>
                  </label>
                  <SAPDateInput
                    value={taxDate}
                    onChange={(value) => setTaxDate(value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Gerekli Tarih (OPRQ.Reqdate) <span className="text-red-500">*</span>
                  </label>
                  <SAPDateInput
                    value={reqdate}
                    onChange={(value) => setReqdate(value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground mb-2 block">
                    Geçerlilik Tarihi (OPRQ.DocDueDate) <span className="text-red-500">*</span>
                  </label>
                  <SAPDateInput
                    value={docDueDate}
                    onChange={(value) => setDocDueDate(value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Talep Özeti (OPRQ.U_TalepOzeti) <span className="text-red-500">*</span>
                </label>
                <Input
                  value={uTalepOzeti}
                  onChange={(e) => setUTalepOzeti(e.target.value)}
                  placeholder="Talep özetini giriniz..."
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setUAcilMi(!uAcilMi)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    uAcilMi ? "bg-red-50 border-red-400 shadow-md" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full ${
                          uAcilMi ? "bg-red-500" : "bg-gray-300"
                        }`}
                      >
                        <span className="text-xl">⚠️</span>
                      </div>
                      <div className="text-left">
                        <div className={`font-semibold text-base ${uAcilMi ? "text-red-700" : "text-gray-700"}`}>
                          Acil Talep (OPRQ.U_AcilMi)
                        </div>
                        <div className="text-xs text-gray-600">Bu talebin öncelikli olarak işlenmesi gerekiyor</div>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        uAcilMi ? "bg-red-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          uAcilMi ? "right-1" : "left-1"
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
                        OcrCode: "", // PRQ1.OcrCode (Departman)
                        ItemCode: "", // OITM.ItemCode
                        ItemName: "", // OITM.ItemName
                        PQTRegdate: reqdate, // PRQ1.PQTRegdate - Başlıktaki gerekli tarihi kullan
                        Quantity: "", // PRQ1.Quantity
                        UomCode: "", // PRQ1.UomCode
                        VendorCode: "", // PRQ1.VendorCode
                        FreeTxt: "", // PRQ1.FreeTxt
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
                  <div className="overflow-hidden min-w-[1270px]">
                    {/* Filter Row - Compact */}
                    <div className="bg-gray-50 border-b border-gray-200">
                      <div className="grid grid-cols-[180px_minmax(200px,1fr)_140px_80px_100px_120px_100px_150px_100px_80px]">
                        <div className="px-1.5 py-1.5 border-r border-gray-200">
                          <Input
                            placeholder="Filtrele..."
                            className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                            value={filters.ItemCode}
                            onChange={(e) => setFilters({ ...filters, ItemCode: e.target.value })}
                          />
                        </div>
                        <div className="px-1.5 py-1.5 border-r border-gray-200">
                          <Input
                            placeholder="Filtrele..."
                            className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                            value={filters.ItemName}
                            onChange={(e) => setFilters({ ...filters, ItemName: e.target.value })}
                          />
                        </div>
                        <div className="px-1.5 py-1.5 border-r border-gray-200">
                          <Input
                            type="date"
                            className="h-7 text-[10px] bg-white border-gray-200 px-1 w-full cursor-pointer"
                            value={filters.PQTRegdate}
                            onChange={(e) => setFilters({ ...filters, PQTRegdate: e.target.value })}
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
                            placeholder="#"
                            className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full text-center"
                            value={filters.Quantity}
                            onChange={(e) => setFilters({ ...filters, Quantity: e.target.value })}
                          />
                        </div>
                        <div className="px-1.5 py-1.5 border-r border-gray-200">
                          <select
                            className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                            value={filters.UomCode}
                            onChange={(e) => setFilters({ ...filters, UomCode: e.target.value })}
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
                        <div className="px-1.5 py-1.5 border-r border-gray-200">
                          <select
                            className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                            value={filters.VendorCode}
                            onChange={(e) => setFilters({ ...filters, VendorCode: e.target.value })}
                          >
                            <option value="">Tümü</option>
                            <option value="V0001">V0001</option>
                            <option value="V0002">V0002</option>
                            <option value="V0006">V0006</option>
                          </select>
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
                            placeholder="Filtrele..."
                            className="h-7 text-[11px] bg-white border-gray-200 px-1.5 w-full"
                            value={filters.FreeTxt}
                            onChange={(e) => setFilters({ ...filters, FreeTxt: e.target.value })}
                          />
                        </div>
                        <div className="px-1.5 py-1.5 border-r border-gray-200">
                          <select
                            className="h-7 text-[11px] bg-white border border-gray-200 rounded-md px-1 w-full"
                            value={filters.hasFile}
                            onChange={(e) => setFilters({ ...filters, hasFile: e.target.value })}
                          >
                            <option value="">Tümü</option>
                            <option value="var">Var</option>
                            <option value="yok">Yok</option>
                          </select>
                        </div>
                        <div className="px-1.5 py-1.5 flex items-center justify-center">
                          <span className="text-xs text-gray-400">🗑️</span>
                        </div>
                      </div>
                    </div>

                    {/* Header Row */}
                    <div className="bg-[#ECF2FF] border-b border-border">
                      <div className="grid grid-cols-[180px_minmax(200px,1fr)_140px_80px_100px_120px_100px_150px_100px_80px]">
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Kalem Kodu (ItemCode) <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Kalem Tanımı (ItemName) <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Gerekli Tarih (PQTRegdate) <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Miktar (Quantity) <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Ölçü Birimi (UomCode) <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Satıcı (VendorCode)
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Departman (OcrCode) <span className="text-red-500">*</span>
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">
                          Açıklama (FreeTxt)
                        </div>
                        <div className="px-3 py-3 border-r border-border text-sm font-medium text-[#181C14]">Ek Dosya</div>
                        <div className="px-3 py-3 text-sm font-medium text-[#181C14]">İşlemler</div>
                      </div>
                    </div>

                    {/* Data Rows */}
                    {filteredRows.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-[180px_minmax(200px,1fr)_140px_80px_100px_120px_100px_150px_100px_80px] border-b border-border bg-white hover:bg-muted/50 transition-colors"
                      >
                        <div className="px-3 py-3 border-r border-border">
                          <div className="flex items-center gap-1">
                            <Input
                              value={row.ItemCode}
                              onChange={(e) => handleRowFieldChange(row.id, "ItemCode", e.target.value)}
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
                              value={row.ItemName}
                              readOnly
                              placeholder="Kalem kodu seçilince otomatik dolar..."
                              className="h-8 text-xs bg-muted border-border flex-1 cursor-not-allowed"
                              title="Kalem Kodu seçildiğinde otomatik olarak dolar"
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
                            value={row.PQTRegdate}
                            onChange={(value) => handleRowFieldChange(row.id, "PQTRegdate", value)}
                            className="h-8 text-xs bg-background border-border"
                          />
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <Input
                            type="number"
                            value={row.Quantity}
                            onChange={(e) => handleRowFieldChange(row.id, "Quantity", e.target.value)}
                            placeholder="Miktar..."
                            className="h-8 text-xs bg-background border-border"
                          />
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <select
                            value={row.UomCode}
                            onChange={(e) => handleRowFieldChange(row.id, "UomCode", e.target.value)}
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
                          <div className="relative">
                            <Input
                              value={row.VendorCode}
                              readOnly
                              onClick={() => {
                                setSelectedRowId(row.id)
                                setIsVendorDialogOpen(true)
                              }}
                              placeholder="Satıcı seçiniz..."
                              className="h-8 text-xs cursor-pointer pr-8"
                            />
                            <List
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                            />
                          </div>
                        </div>
                        <div className="px-3 py-3 border-r border-border">
                          <select
                            value={row.OcrCode}
                            onChange={(e) => handleRowFieldChange(row.id, "OcrCode", e.target.value)}
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
                            value={row.FreeTxt}
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
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Açıklamalar (OPRQ.Comments)
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Ek notlar giriniz..."
                  className="bg-muted border-border text-foreground min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button onClick={handleSubmit} className="text-sm" style={{ backgroundColor: "rgba(237, 124, 30)" }}>
                {isEditMode ? "Güncelle ve Tekrar Gönder" : "SAP'ye Gönder (Satınalma Talebi)"}
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
                  ? { ...row, ItemCode: item.itemCode, ItemName: item.itemName, isDummy: item.itemCode === "DUMMY" }
                  : row,
              ),
            )
          }
        }}
      />
      <VendorSelectionDialog
        open={isVendorDialogOpen}
        onOpenChange={setIsVendorDialogOpen}
        onVendorSelected={(vendor) => {
          if (selectedRowId !== null) {
            setTableRows((currentRows) =>
              currentRows.map((row) =>
                row.id === selectedRowId
                  ? { ...row, VendorCode: vendor.vendorName }
                  : row,
              ),
            )
          }
        }}
      />
    </div>
  )
}
