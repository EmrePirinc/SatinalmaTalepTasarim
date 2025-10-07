import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  Home,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Shield,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:static inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 md:translate-x-0`}>
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <div className="text-xl font-bold" style={{ color: "rgba(237, 124, 30)" }}>
            ANADOLU BAKIR
          </div>
        </div>

        <nav className="flex-1 py-4">
          <div className="px-4 mb-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin Panel</div>
          </div>

          <div className="space-y-1 px-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
              <Home className="w-5 h-5" />
              <span className="text-sm">Dashboard</span>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: "rgba(237, 124, 30)" }}
            >
              <Users className="w-5 h-5" />
              <span>Kullanıcı Yönetimi</span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Ayarlar</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(237, 124, 30) 0%, rgba(200, 100, 20) 100%)" }}
            >
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full text-sm">
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-md"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg md:text-xl font-semibold">Kullanıcı Yönetimi</h2>
          </div>
          <Button
            onClick={() => {
              setFormData({ username: "", password: "", name: "", role: "user" })
              setIsAddDialogOpen(true)
            }}
            style={{ backgroundColor: "rgba(237, 124, 30)" }}
            className="text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Yeni Kullanıcı Ekle</span>
          </Button>
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
