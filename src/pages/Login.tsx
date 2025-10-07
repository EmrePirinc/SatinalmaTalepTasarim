import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User } from "lucide-react"

// Mock kullanıcılar
const mockUsers = [
  { id: 1, username: "talep.acan", password: "123456", name: "Selim Aksu", role: "user" },
  { id: 2, username: "satinalma", password: "123456", name: "Ahmet Yılmaz", role: "purchaser" },
  { id: 3, username: "admin", password: "123456", name: "Admin User", role: "admin" },
]

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    // Kullanıcı doğrulama
    const user = mockUsers.find((u) => u.username === username && u.password === password)

    if (!user) {
      setError("Kullanıcı adı veya şifre hatalı!")
      return
    }

    // Kullanıcı bilgilerini localStorage'a kaydet
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      })
    )

    // Kullanıcı listesini de kaydet (admin için)
    if (!localStorage.getItem("users")) {
      localStorage.setItem("users", JSON.stringify(mockUsers))
    }

    // Role göre yönlendirme
    if (user.role === "admin") {
      navigate("/admin")
    } else if (user.role === "purchaser") {
      navigate("/talep-listesi")
    } else {
      navigate("/")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: "linear-gradient(135deg, rgba(237, 124, 30) 0%, rgba(200, 100, 20) 100%)" }}>
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "rgba(237, 124, 30)" }}>
              ANADOLU BAKIR
            </h1>
            <p className="text-sm text-muted-foreground mt-2">Satınalma Yönetim Sistemi</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Kullanıcı Adı</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Kullanıcı adınızı giriniz"
                className="w-full"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Şifre</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi giriniz"
                className="w-full"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

            <Button
              onClick={handleLogin}
              className="w-full text-white"
              style={{ backgroundColor: "rgba(237, 124, 30)" }}
            >
              Giriş Yap
            </Button>
          </div>

          {/* Demo Bilgisi */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-2">Demo Kullanıcılar:</p>
            <div className="space-y-1">
              <p>👤 <strong>Talep Açan:</strong> talep.acan / 123456</p>
              <p>🛒 <strong>Satınalmacı:</strong> satinalma / 123456</p>
              <p>⚙️ <strong>Admin:</strong> admin / 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
