import { useState, useEffect } from "react"
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
  Bell,
  Settings,
  User,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Menu,
} from "lucide-react"

type User = {
  id: number
  username: string
  password: string
  name: string
  role: "user" | "purchaser" | "admin"
}

const roleLabels = {
  user: "Talep Açan",
  purchaser: "Satınalmacı",
  admin: "Admin",
}

const roleColors = {
  user: "bg-blue-100 text-blue-800 border-blue-300",
  purchaser: "bg-green-100 text-green-800 border-green-300",
  admin: "bg-purple-100 text-purple-800 border-purple-300",
}

export default function Admin() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    role: "user" as "user" | "purchaser" | "admin",
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
    if (!formData.username || !formData.password || !formData.name) {
      alert("Lütfen tüm alanları doldurun!")
      return
    }

    const newUser: User = {
      id: Date.now(),
      username: formData.username,
      password: formData.password,
      name: formData.name,
      role: formData.role,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setIsAddDialogOpen(false)
    setFormData({ username: "", password: "", name: "", role: "user" })
    alert("Kullanıcı başarıyla eklendi!")
  }

  const handleEditUser = () => {
    if (!selectedUser || !formData.username || !formData.name) {
      alert("Lütfen tüm alanları doldurun!")
      return
    }

    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? { ...u, username: formData.username, name: formData.name, role: formData.role, password: formData.password || u.password }
        : u
    )

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    setIsEditDialogOpen(false)
    setSelectedUser(null)
    setFormData({ username: "", password: "", name: "", role: "user" })
    alert("Kullanıcı başarıyla güncellendi!")
  }

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser.id) {
      alert("Kendi hesabınızı silemezsiniz!")
      return
    }

    if (!confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
      return
    }

    const updatedUsers = users.filter((u) => u.id !== user.id)
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    alert("Kullanıcı silindi!")
  }

  const handleClearAllRequests = () => {
    if (!confirm("⚠️ DİKKAT!\n\nTüm satınalma talepleri kalıcı olarak silinecektir.\nBu işlem geri alınamaz!\n\nDevam etmek istediğinize emin misiniz?")) {
      return
    }

    // İkinci onay
    if (!confirm("🚨 SON UYARI!\n\nTüm talep verileri silinecek ve doküman numarası 1'den başlayacak.\n\nEMİN MİSİNİZ?")) {
      return
    }

    localStorage.removeItem("purchaseRequests")
    alert("✅ Tüm talep verileri başarıyla temizlendi!\n\nYeni talepler 1 numarasından başlayacak.")
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      password: "",
      name: user.name,
      role: user.role,
    })
    setIsEditDialogOpen(true)
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
            <Button
              onClick={handleClearAllRequests}
              variant="destructive"
              className="h-8 px-3 text-xs shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Tüm Talepleri Temizle</span>
            </Button>
            <Button
              onClick={() => {
                setFormData({ username: "", password: "", name: "", role: "user" })
                setIsAddDialogOpen(true)
              }}
              className="h-8 px-3 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Yeni Kullanıcı</span>
            </Button>
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
          <div className="bg-card rounded-lg border border-border shadow-sm overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#ECF2FF]">
                <TableRow>
                  <TableHead className="text-[#181C14]">Kullanıcı Adı</TableHead>
                  <TableHead className="text-[#181C14]">Ad Soyad</TableHead>
                  <TableHead className="text-[#181C14]">Rol</TableHead>
                  <TableHead className="text-[#181C14] text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => openEditDialog(user)}
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user)}
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          disabled={user.id === currentUser?.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kullanıcı Adı</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Kullanıcı adı"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Şifre</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Şifre"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ad Soyad</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full h-10 px-3 border border-border rounded-md"
              >
                <option value="user">Talep Açan</option>
                <option value="purchaser">Satınalmacı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAddUser} style={{ backgroundColor: "rgba(237, 124, 30)" }}>
              Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Kullanıcı Adı</label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Kullanıcı adı"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Yeni Şifre (Boş bırakılırsa değişmez)</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Yeni şifre"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Ad Soyad</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ad Soyad"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rol</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full h-10 px-3 border border-border rounded-md"
              >
                <option value="user">Talep Açan</option>
                <option value="purchaser">Satınalmacı</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEditUser} style={{ backgroundColor: "rgba(237, 124, 30)" }}>
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
