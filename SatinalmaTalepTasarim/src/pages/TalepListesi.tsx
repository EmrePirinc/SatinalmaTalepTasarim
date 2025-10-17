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
  DialogDescription,
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
  Package,
  Bell,
  Calendar,
  Search,
  Settings,
  User,
  Menu,
  Eye,
  LogOut,
  Download,
} from "lucide-react"
import * as XLSX from "xlsx"
import ExcelJS from "exceljs"

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
  U_RedNedeni?: string // Red nedeni
  U_RevizeNedeni?: string // Revize nedeni
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
        U_RedNedeni: req.U_RedNedeni,
        U_RevizeNedeni: req.U_RevizeNedeni,
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
      if (currentUser) {
        await fetchRequestsFromBackend(currentUser)
      }

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
      if (currentUser) {
        await fetchRequestsFromBackend(currentUser)
      }

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

  const handleExportToExcel = async () => {
    // ExcelJS workbook oluştur
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Talep Listesi')

    // Başlık satırını ekle
    worksheet.columns = [
      { header: 'Doküman No', key: 'DocNum', width: 15 },
      { header: 'Talep Özeti', key: 'U_TalepOzeti', width: 35 },
      { header: 'Talep Eden', key: 'Reqname', width: 20 },
      { header: 'Belge Tarihi', key: 'TaxDate', width: 15 },
      { header: 'Gerekli Tarih', key: 'Reqdate', width: 15 },
      { header: 'Geçerlilik Tarihi', key: 'DocDueDate', width: 15 },
      { header: 'Kayıt Tarihi', key: 'DocDate', width: 15 },
      { header: 'Acil', key: 'U_AcilMi', width: 10 },
      { header: 'Durum', key: 'U_TalepDurum', width: 20 },
    ]

    // Başlık satırını stillendir
    const headerRow = worksheet.getRow(1)
    headerRow.height = 25
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFED7C1E' } // Turuncu
      }
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    })

    // Veri satırlarını ekle
    filteredRequests.forEach((request: any, index: number) => {
      const row = worksheet.addRow({
        DocNum: request.DocNum,
        U_TalepOzeti: request.U_TalepOzeti || "-",
        Reqname: request.Reqname,
        TaxDate: formatDate(request.TaxDate),
        Reqdate: formatDate(request.Reqdate),
        DocDueDate: request.DocDueDate ? formatDate(request.DocDueDate) : "-",
        DocDate: formatDate(request.DocDate),
        U_AcilMi: request.U_AcilMi ? "Evet" : "Hayır",
        U_TalepDurum: request.U_TalepDurum,
      })

      // Zebra deseni
      const isEvenRow = (index % 2) === 0
      row.height = 20

      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF' }
        }
        cell.font = {
          size: 11,
          color: { argb: 'FF1F2937' }
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 2 ? 'left' : 'center' // Talep Özeti sola hizalı
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        }
      })
    })

    // Dosya adı oluştur
    const today = new Date()
    const dateStr = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`
    const fileName = `Satinalma_Talep_Listesi_${dateStr}.xlsx`

    // Excel dosyasını indir
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExportDetailToExcel = async (request: PurchaseRequest) => {
    // ExcelJS workbook oluştur
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Talep Detayı')

    // ===== BÖLÜM 1: TURUNCU BAŞLIKLAR VE GENEl BİLGİLER =====
    // 1. Satır: Turuncu başlıklar (genel bilgiler)
    const generalHeaders = [
      'Doküman No', 'Talep Özeti', 'Talep Eden', 'Belge Tarihi', 'Gerekli Tarih',
      'Geçerlilik Tarihi', 'Kayıt Tarihi', 'Acil', 'Durum',
      'Açıklamalar', 'Revize Nedeni', 'Red Nedeni'
    ]

    const generalHeaderRow = worksheet.addRow(generalHeaders)
    generalHeaderRow.height = 30

    // Turuncu başlık stilini uygula
    generalHeaders.forEach((header, index) => {
      const col = index + 1
      const cell = generalHeaderRow.getCell(col)

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFED7C1E' } // Turuncu
      }
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    })

    // 2. Satır: Genel bilgilerin değerleri
    const generalDataRow = worksheet.addRow([
      request.DocNum,
      request.U_TalepOzeti || "-",
      request.Reqname,
      formatDate(request.TaxDate),
      formatDate(request.Reqdate),
      request.DocDueDate ? formatDate(request.DocDueDate) : "-",
      formatDate(request.DocDate),
      request.U_AcilMi ? "Evet" : "Hayır",
      request.U_TalepDurum,
      request.Comments || "-",
      request.U_RevizeNedeni || "-",
      request.U_RedNedeni || "-"
    ])
    generalDataRow.height = 25

    // Genel veri satırını stillendir
    generalDataRow.eachCell((cell, colNumber) => {
      const isNotesColumn = colNumber >= 10 && colNumber <= 12

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFFFF' }
      }
      cell.font = {
        size: 11,
        color: { argb: 'FF1F2937' }
      }
      cell.alignment = {
        vertical: 'top',
        horizontal: (colNumber === 2 || isNotesColumn) ? 'left' : 'center',
        wrapText: isNotesColumn
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      }
    })

    // 3. Satır: Boş satır
    worksheet.addRow([])

    // ===== BÖLÜM 2: MAVİ BAŞLIKLAR VE KALEM DETAYLARı =====
    // 4. Satır: Mavi başlıklar (kalem detayları)
    const itemHeaders = [
      'Satır No', 'Kalem Kodu', 'Kalem Tanımı', 'Departman',
      'Miktar', 'Birim', 'Satıcı', 'Kalem Gerekli Tarih', 'Kalem Açıklaması', 'Ek Dosya'
    ]

    const itemHeaderRow = worksheet.addRow(itemHeaders)
    itemHeaderRow.height = 30

    // Mavi başlık stilini uygula
    itemHeaders.forEach((header, index) => {
      const col = index + 1
      const cell = itemHeaderRow.getCell(col)

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' } // Mavi
      }
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        size: 12
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    })

    // Kolon genişliklerini ayarla
    worksheet.columns = [
      { key: 'col1', width: 10 },  // Satır No
      { key: 'col2', width: 20 },  // Kalem Kodu
      { key: 'col3', width: 30 },  // Kalem Tanımı
      { key: 'col4', width: 15 },  // Departman
      { key: 'col5', width: 10 },  // Miktar
      { key: 'col6', width: 10 },  // Birim
      { key: 'col7', width: 20 },  // Satıcı
      { key: 'col8', width: 18 },  // Kalem Gerekli Tarih
      { key: 'col9', width: 35 },  // Kalem Açıklaması
      { key: 'col10', width: 20 }  // Ek Dosya
    ]

    // 5. Satır ve sonrası: Kalem verileri
    const items = (request.items && request.items.length > 0) ? request.items : [{}]

    items.forEach((item: any, index: number) => {
      const itemRowData = [
        item.ItemCode ? index + 1 : "-",
        item.ItemCode || "-",
        item.ItemName || "-",
        item.OcrCode || "-",
        item.Quantity || "-",
        item.UomCode || "-",
        item.VendorCode || "-",
        item.PQTRegdate ? formatDate(item.PQTRegdate) : "-",
        item.FreeTxt || "-",
        (item.file || item.fileData) ? (item.file?.name || item.fileData?.name) : "-"
      ]

      const row = worksheet.addRow(itemRowData)
      row.height = 25

      // Zebra deseni
      const isEvenRow = (index % 2) === 0

      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEvenRow ? 'FFF9FAFB' : 'FFFFFFFF' }
        }
        cell.font = {
          size: 11,
          color: { argb: 'FF1F2937' }
        }
        cell.alignment = {
          vertical: 'top',
          horizontal: (colNumber === 3 || colNumber === 9) ? 'left' : 'center', // Tanım ve Açıklama sola
          wrapText: colNumber === 9 // Açıklama için text wrap
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        }
      })
    })

    // Dosya adı oluştur
    const fileName = `Talep_${request.DocNum}_Detay.xlsx`

    // Excel dosyasını indir
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
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
                <div className="overflow-hidden min-w-[1400px]">
                  {/* Filter Row - Compact */}
                  <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
                    <div className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_70px_130px_80px]">
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
                    <div className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_70px_130px_80px]">
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
                      className="grid grid-cols-[130px_minmax(180px,1fr)_150px_120px_120px_120px_120px_70px_130px_80px] border-b border-border bg-white hover:bg-orange-50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetails(request)}
                    >
                      <div className="px-3 py-3 border-r border-border text-sm">{request.DocNum}</div>
                      <div className="px-3 py-3 border-r border-border text-sm truncate">{request.U_TalepOzeti || "-"}</div>
                      <div className="px-3 py-3 border-r border-border text-sm">{request.Reqname}</div>
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b-2 pb-3 flex-shrink-0" style={{ borderColor: "rgba(237, 124, 30, 0.2)" }}>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold" style={{ color: "rgba(237, 124, 30)" }}>
                <span>📋 Doküman No: {selectedRequest?.DocNum}</span>
              </DialogTitle>
              {selectedRequest && (
                <Button
                  onClick={() => handleExportDetailToExcel(selectedRequest)}
                  className="flex items-center gap-2 text-sm font-medium h-9"
                  style={{ backgroundColor: "rgba(237, 124, 30)", borderColor: "rgba(237, 124, 30)" }}
                  title="Detayı Excel'e Aktar"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel'e Aktar</span>
                </Button>
              )}
            </div>
            <DialogDescription className="sr-only">
              Satınalma talebinin detaylı bilgileri ve kalem listesi
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 pt-3 overflow-y-auto flex-1">
              {/* Talep Özeti - Başlık */}
              {selectedRequest.U_TalepOzeti && (
                <div className="relative overflow-hidden rounded-lg shadow-sm p-4" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)", borderLeft: "4px solid rgba(237, 124, 30, 1)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>📝 Talep Özeti</span>
                  </div>
                  <p className="text-base font-semibold text-gray-800 leading-relaxed">{selectedRequest.U_TalepOzeti}</p>
                </div>
              )}

              {/* Durum ve Acil Talep Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold border ${statusColors[selectedRequest.U_TalepDurum]}`}
                >
                  {selectedRequest.U_TalepDurum}
                </span>
                {selectedRequest.U_AcilMi && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500 text-white text-xs font-bold border border-red-600">
                    <span>⚠️</span>
                    <span>ACİL TALEP</span>
                  </span>
                )}
              </div>

              {/* Genel Bilgiler */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-lg">👤</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>Talep Eden</span>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{selectedRequest.Reqname}</p>
                </div>
                <div className={`rounded-lg shadow-sm border p-3 ${
                  selectedRequest.U_AcilMi
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-lg">{selectedRequest.U_AcilMi ? '⚠️' : '✅'}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      selectedRequest.U_AcilMi ? 'text-red-600' : 'text-green-600'
                    }`}>Aciliyet</span>
                  </div>
                  <p className={`text-sm font-bold ${
                    selectedRequest.U_AcilMi ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {selectedRequest.U_AcilMi ? 'ACİL' : 'Normal'}
                  </p>
                </div>
              </div>

              {/* Tarihler Bölümü */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" style={{ color: "rgba(237, 124, 30)" }} />
                  <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Tarihler</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1 p-2 rounded-md bg-gray-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">📄 Belge</span>
                    <p className="text-sm font-bold text-gray-800">{formatDate(selectedRequest.TaxDate)}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-md bg-orange-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(237, 124, 30)" }}>⏰ Gerekli</span>
                    <p className="text-sm font-bold" style={{ color: "rgba(237, 124, 30)" }}>{formatDate(selectedRequest.Reqdate)}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-md bg-gray-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">💾 Kayıt</span>
                    <p className="text-sm font-bold text-gray-800">{formatDate(selectedRequest.DocDate)}</p>
                  </div>
                  <div className="flex flex-col gap-1 p-2 rounded-md bg-green-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">✅ Geçerlilik</span>
                    <p className="text-sm font-bold text-green-800">{formatDate(selectedRequest.DocDueDate)}</p>
                  </div>
                </div>
              </div>

              {/* Kalem Listesi */}
              {selectedRequest.items && selectedRequest.items.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4" style={{ color: "rgba(237, 124, 30)" }} />
                    <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Kalem Listesi</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", color: "rgba(237, 124, 30)" }}>
                      {selectedRequest.items.length} Kalem
                    </span>
                  </div>
                  <div className="border rounded-md overflow-x-auto" style={{ borderColor: "rgba(237, 124, 30, 0.2)" }}>
                    <Table>
                      <TableHeader style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.1) 0%, rgba(237, 124, 30, 0.05) 100%)" }}>
                        <TableRow>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Kalem Kodu</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Kalem Tanımı</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Departman</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Miktar</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Birim</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Satıcı</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Gerekli Tarih</TableHead>
                          <TableHead className="font-bold text-xs p-2" style={{ color: "rgba(237, 124, 30)" }}>Açıklama</TableHead>
                          <TableHead className="font-bold text-xs p-2 text-center" style={{ color: "rgba(237, 124, 30)" }}>Ek Dosya</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRequest.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium text-xs p-2">
                              {item.isDummy && <span className="text-orange-600 mr-1" title="Dummy Kalem">🔸</span>}
                              {item.ItemCode}
                            </TableCell>
                            <TableCell className="text-xs p-2">{item.ItemName}</TableCell>
                            <TableCell className="text-xs p-2">{item.OcrCode}</TableCell>
                            <TableCell className="text-xs p-2">{item.Quantity}</TableCell>
                            <TableCell className="text-xs p-2">{item.UomCode}</TableCell>
                            <TableCell className="text-xs p-2">{item.VendorCode || "-"}</TableCell>
                            <TableCell className="text-xs p-2">{formatDate(item.PQTRegdate)}</TableCell>
                            <TableCell className="text-xs p-2 max-w-[200px] truncate">
                              {item.FreeTxt ? (
                                <span className="text-gray-700" title={item.FreeTxt}>{item.FreeTxt}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs p-2 text-center">
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
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors hover:opacity-80"
                                  style={{
                                    backgroundColor: "rgba(237, 124, 30, 0.1)",
                                    color: "rgba(237, 124, 30)",
                                    border: "1px solid rgba(237, 124, 30, 0.3)"
                                  }}
                                  title={`İndir: ${item.file?.name || item.fileData?.name}`}
                                >
                                  <span>📎</span>
                                  <span className="max-w-[80px] truncate">{item.file?.name || item.fileData?.name}</span>
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

              {/* Notlar - 3 Bölüm Yan Yana */}
              <div className="grid grid-cols-3 gap-3">
                {/* 1. Açıklamalar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3" style={{ borderTop: "4px solid rgba(237, 124, 30, 1)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📝</span>
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "rgba(237, 124, 30)" }}>Açıklamalar</span>
                  </div>
                  <div className="p-3 rounded-md text-sm text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[100px]" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30, 0.05) 0%, rgba(237, 124, 30, 0.02) 100%)", border: "1px solid rgba(237, 124, 30, 0.1)" }}>
                    {selectedRequest.Comments || "-"}
                  </div>
                </div>

                {/* 2. Revize Nedeni */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3" style={{ borderTop: "4px solid rgba(255, 165, 0, 1)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🔄</span>
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "rgba(255, 165, 0)" }}>Revize Nedeni</span>
                  </div>
                  <div className="p-3 rounded-md text-sm text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[100px]" style={{ background: "linear-gradient(135deg, rgba(255, 165, 0, 0.05) 0%, rgba(255, 165, 0, 0.02) 100%)", border: "1px solid rgba(255, 165, 0, 0.1)" }}>
                    {selectedRequest.U_RevizeNedeni || "-"}
                  </div>
                </div>

                {/* 3. Red Nedeni */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3" style={{ borderTop: "4px solid rgba(220, 38, 38, 1)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">❌</span>
                    <span className="text-sm font-bold uppercase tracking-wide" style={{ color: "rgba(220, 38, 38)" }}>Red Nedeni</span>
                  </div>
                  <div className="p-3 rounded-md text-sm text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[100px]" style={{ background: "linear-gradient(135deg, rgba(220, 38, 38, 0.05) 0%, rgba(220, 38, 38, 0.02) 100%)", border: "1px solid rgba(220, 38, 38, 0.1)" }}>
                    {selectedRequest.U_RedNedeni || "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Satınalmacı ve Admin Butonları */}
          {selectedRequest && (currentUser?.role === "purchaser" || currentUser?.role === "admin") && (selectedRequest.U_TalepDurum === "Satınalmacıda" || selectedRequest.U_TalepDurum === "Satınalma Talebi") && (
            <DialogFooter className="gap-2 flex-shrink-0 pt-3 border-t">
              <Button
                onClick={handleRejectClick}
                variant="destructive"
                className="text-sm h-9"
              >
                Reddet
              </Button>
              <Button
                onClick={handleReviseClick}
                variant="outline"
                className="text-sm h-9"
              >
                Revize İste
              </Button>
            </DialogFooter>
          )}

          {/* Talep Sahibi - Revize Durumu Butonu */}
          {selectedRequest && currentUser?.role === "user" && selectedRequest.U_TalepDurum === "Revize İstendi" && selectedRequest.Reqname === currentUser?.name && (
            <DialogFooter className="gap-2 flex-shrink-0 pt-3 border-t">
              <Button
                onClick={handleEditAndResubmit}
                className="text-sm h-9"
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
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
              <span>❌</span>
              <span>Talebi Reddet</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Satınalma talebini reddetme formu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-xs text-red-800">
                <strong>Doküman No:</strong> {selectedRequest?.DocNum}
              </p>
              <p className="text-xs text-red-800">
                <strong>Talep Eden:</strong> {selectedRequest?.Reqname}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Reddetme Sebebi <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Talebin neden reddedildiğini açıklayınız..."
                className="min-h-[100px] resize-none text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setRejectReason("")
                setIsRejectDialogOpen(false)
              }}
              className="text-sm h-9"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim()}
              className="text-sm h-9"
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revize Dialog'u */}
      <Dialog open={isReviseDialogOpen} onOpenChange={setIsReviseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2" style={{ color: "rgba(237, 124, 30)" }}>
              <span>🔄</span>
              <span>Revize İste</span>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Satınalma talebinde revize talep etme formu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-3">
            <div className="border-l-4 p-3 rounded" style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", borderColor: "rgba(237, 124, 30)" }}>
              <p className="text-xs" style={{ color: "rgba(237, 124, 30)" }}>
                <strong>Doküman No:</strong> {selectedRequest?.DocNum}
              </p>
              <p className="text-xs" style={{ color: "rgba(237, 124, 30)" }}>
                <strong>Talep Eden:</strong> {selectedRequest?.Reqname}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Revize Sebebi <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={reviseReason}
                onChange={(e) => setReviseReason(e.target.value)}
                placeholder="Hangi değişikliklerin yapılmasını istiyorsunuz?"
                className="min-h-[100px] resize-none text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setReviseReason("")
                setIsReviseDialogOpen(false)
              }}
              className="text-sm h-9"
            >
              İptal
            </Button>
            <Button
              onClick={handleReviseConfirm}
              disabled={!reviseReason.trim()}
              style={{ backgroundColor: "rgba(237, 124, 30)" }}
              className="text-sm h-9"
            >
              Revize İste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
