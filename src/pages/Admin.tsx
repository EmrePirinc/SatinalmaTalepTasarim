import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Sidebar from "@/components/Sidebar"
import UserSelectionDialog, { UserOption } from "@/components/UserSelectionDialog"
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
  Bell,
  Settings,
  User,
  LogOut,
  Plus,
  Menu,
} from "lucide-react"

type User = {
  id: number
  sapId: string
  username: string
  password: string
  name: string
  role: "user" | "purchaser" | "admin"
  purchasingAuth: boolean
  financeAuth: boolean
  status: "active" | "inactive"
}

export default function Admin() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUserSelectionOpen, setIsUserSelectionOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    sapId: "",
    username: "",
    name: "",
    role: "user" as "user" | "purchaser" | "admin",
    purchasingAuth: false,
    financeAuth: false,
    status: "active" as "active" | "inactive",
  })

  useEffect(() => {
    // Kullanıcı kontrolü
    const user = localStorage.getItem("currentUser")
    if (!user) {
      navigate("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "admin") {
      alert("Bu sayfaya erişim yetkiniz yok!")
      navigate("/")
      return
    }

    setCurrentUser(parsedUser)

    // Kullanıcıları yükle
    const savedUsers = localStorage.getItem("users")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    navigate("/login")
  }

  const handleAddUser = () => {
    if (!formData.sapId || !formData.username || !formData.name) {
      alert("Lütfen tüm zorunlu alanları doldurun!")
      return
    }

    const newUser: User = {
      id: Date.now(),
      sapId: formData.sapId,
      username: formData.username,
      password: "1234", // Default şifre
      name: formData.name,
      role: formData.role,
      purchasingAuth: formData.purchasingAuth,
      financeAuth: formData.financeAuth,
      status: formData.status,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setIsAddDialogOpen(false)
    setFormData({ sapId: "", username: "", name: "", role: "user", purchasingAuth: false, financeAuth: false, status: "active" })
    alert("Kullanıcı başarıyla eklendi!")
  }

  const handleEditUser = () => {
    if (!selectedUser) {
      alert("Kullanıcı seçilmedi!")
      return
    }

    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? {
            ...u,
            role: formData.role,
            purchasingAuth: formData.purchasingAuth,
            financeAuth: formData.financeAuth,
            status: formData.status,
          }
        : u
    )

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setIsEditDialogOpen(false)
    setSelectedUser(null)
    setFormData({ sapId: "", username: "", name: "", role: "user", purchasingAuth: false, financeAuth: false, status: "active" })
    alert("Kullanıcı başarıyla güncellendi!")
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      sapId: user.sapId,
      username: user.username,
      name: user.name,
      role: user.role,
      purchasingAuth: user.purchasingAuth,
      financeAuth: user.financeAuth,
      status: user.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleUserSelected = (user: UserOption) => {
    setFormData((prev) => ({
      ...prev,
      sapId: user.sapId,
      username: user.username,
      name: user.name,
    }))
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
              <h1 className="text-base font-semibold text-gray-800">Kullanıcı Yönetimi</h1>
              <span className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>Admin Panel</span>
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
                  <span className="text-[10px] text-gray-400 leading-tight">Admin</span>
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

        <main className="flex-1 overflow-auto p-3 md:p-6">
          <div className="mb-4">
            <Button
              onClick={() => {
                setFormData({ sapId: "", username: "", name: "", role: "user", purchasingAuth: false, financeAuth: false, status: "active" })
                setIsAddDialogOpen(true)
              }}
              className="h-10 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ekle
            </Button>
          </div>
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#ECF2FF]">
                <TableRow>
                  <TableHead className="text-[#181C14]">SAP ID</TableHead>
                  <TableHead className="text-[#181C14]">Ad Soyad</TableHead>
                  <TableHead className="text-[#181C14]">E-posta Adresi</TableHead>
                  <TableHead className="text-[#181C14]">Satın Alma Yetkisi</TableHead>
                  <TableHead className="text-[#181C14]">Ödeme Süreci Yetkisi</TableHead>
                  <TableHead className="text-[#181C14]">Durum</TableHead>
                  <TableHead className="text-[#181C14] text-right">Düzenle</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.sapId}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      <span className="text-sm">{user.purchasingAuth ? "Ekin" : "Finans Modülü"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.financeAuth ? "Yetkili" : "Yetkisiz"}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          const updatedUsers = users.map((u) =>
                            u.id === user.id ? { ...u, status: (u.status === "active" ? "inactive" : "active") as "active" | "inactive" } : u
                          )
                          setUsers(updatedUsers)
                          localStorage.setItem("users", JSON.stringify(updatedUsers))
                        }}
                        className={`h-8 px-3 text-xs ${
                          user.status === "active"
                            ? "bg-green-500 hover:bg-green-600 text-white"
                            : "bg-gray-500 hover:bg-gray-600 text-white"
                        }`}
                      >
                        {user.status === "active" ? "Aktif" : "Ekin Değil"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => openEditDialog(user)}
                        className="h-8 w-20 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Düzenle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </main>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-gray-700">Yeni Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Ad Soyad */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Ad Soyad</label>
              <div className="relative">
                <Input
                  value={formData.name}
                  readOnly
                  placeholder="Kullanıcı seçmek için tıklayın..."
                  className="cursor-pointer h-12 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsUserSelectionOpen(true)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* SAP Kullanıcı ID ve Etkinlik Durumu */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">SAP Kullanıcı ID</label>
                <Input
                  value={formData.sapId}
                  readOnly
                  placeholder=""
                  className="bg-gray-200 cursor-not-allowed h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Etkinlik Durumu</label>
                <Button
                  type="button"
                  disabled
                  className="w-full h-12 bg-green-500 hover:bg-green-500 text-white rounded-full cursor-not-allowed"
                >
                  Etkin
                </Button>
              </div>
            </div>

            {/* Kullanıcı Adı */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Kullanıcı Adı</label>
              <Input
                value={formData.username}
                readOnly
                placeholder=""
                className="bg-gray-200 cursor-not-allowed h-12 rounded-lg"
              />
            </div>

            {/* Satın Alma Yetkisi ve Finans Yetkisi */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Satın Alma Yetkisi</label>
                <select
                  value={formData.purchasingAuth ? "evet" : "hayir"}
                  onChange={(e) => setFormData({ ...formData, purchasingAuth: e.target.value === "evet" })}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="hayir">Hayır</option>
                  <option value="evet">Evet</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Finans Yetkisi</label>
                <select
                  value={formData.financeAuth ? "evet" : "hayir"}
                  onChange={(e) => setFormData({ ...formData, financeAuth: e.target.value === "evet" })}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="hayir">Hayır</option>
                  <option value="evet">Evet</option>
                </select>
              </div>
            </div>

            {/* Admin */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Admin</label>
              <select
                value={formData.role === "admin" ? "evet" : "hayir"}
                onChange={(e) => setFormData({ ...formData, role: e.target.value === "evet" ? "admin" : "user" as any })}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="hayir">Hayır</option>
                <option value="evet">Evet</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              onClick={handleAddUser}
              className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium"
            >
              Ekle
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="h-12 px-8 bg-[#B8D96C] hover:bg-[#A5C75A] text-white border-0 rounded-full font-medium"
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Selection Dialog */}
      <UserSelectionDialog
        open={isUserSelectionOpen}
        onOpenChange={setIsUserSelectionOpen}
        onUserSelected={handleUserSelected}
      />

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-medium text-gray-700">Kullanıcı Bilgileri Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Ad Soyad */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Ad Soyad</label>
              <Input
                value={formData.name}
                disabled
                className="bg-gray-200 cursor-not-allowed h-12 rounded-lg"
              />
            </div>

            {/* SAP Kullanıcı ID ve Etkinlik Durumu */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">SAP Kullanıcı ID</label>
                <Input
                  value={formData.sapId}
                  disabled
                  className="bg-gray-200 cursor-not-allowed h-12 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Etkinlik Durumu</label>
                <Button
                  type="button"
                  disabled
                  className="w-full h-12 bg-green-500 hover:bg-green-500 text-white rounded-full cursor-not-allowed"
                >
                  Etkin
                </Button>
              </div>
            </div>

            {/* Kullanıcı Adı */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Kullanıcı Adı</label>
              <Input
                value={formData.username}
                disabled
                className="bg-gray-200 cursor-not-allowed h-12 rounded-lg"
              />
            </div>

            {/* Satın Alma Yetkisi ve Finans Yetkisi */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Satın Alma Yetkisi</label>
                <select
                  value={formData.purchasingAuth ? "evet" : "hayir"}
                  onChange={(e) => setFormData({ ...formData, purchasingAuth: e.target.value === "evet" })}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="hayir">Hayır</option>
                  <option value="evet">Evet</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-2 block">Finans Yetkisi</label>
                <select
                  value={formData.financeAuth ? "evet" : "hayir"}
                  onChange={(e) => setFormData({ ...formData, financeAuth: e.target.value === "evet" })}
                  className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="hayir">Hayır</option>
                  <option value="evet">Evet</option>
                </select>
              </div>
            </div>

            {/* Admin */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Admin</label>
              <select
                value={formData.role === "admin" ? "evet" : "hayir"}
                onChange={(e) => setFormData({ ...formData, role: e.target.value === "evet" ? "admin" : "user" as any })}
                className="w-full h-12 px-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="hayir">Hayır</option>
                <option value="evet">Evet</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              onClick={handleEditUser}
              className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium"
            >
              Güncelle
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="h-12 px-8 bg-[#B8D96C] hover:bg-[#A5C75A] text-white border-0 rounded-full font-medium"
            >
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
