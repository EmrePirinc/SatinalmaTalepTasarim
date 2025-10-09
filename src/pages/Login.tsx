import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

// Mock kullanıcılar
const mockUsers = [
  { id: 1, username: "talep.acan", password: "123456", name: "Selim Aksu", role: "user" },
  { id: 2, username: "satinalma", password: "123456", name: "Ahmet Yılmaz", role: "purchaser" },
  { id: 3, username: "admin", password: "123456", name: "Admin User", role: "admin" },
]

export default function Login() {
  const navigate = useNavigate()
  const [company, setCompany] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex h-screen bg-gray-50">
      {/* Sol Taraf - Login Formu */}
      <div className="w-full lg:w-[35%] flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-[380px]">
          {/* Logo */}
          <div className="mb-8">
            <img
              src="/AB_LOGO.png"
              alt="Anadolu Bakır"
              className="h-12 mb-8 object-contain"
            />
            <h1 className="text-xl font-bold text-gray-900 mb-1">Giriş Yap</h1>
            <p className="text-gray-600 text-xs">Satınalma Yönetim Sistemi</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Şirket Adı</label>
              <select
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value)
                  setError("")
                }}
                className="w-full h-12 px-3 text-sm border border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg bg-white"
              >
                <option value="">Şirket seçiniz</option>
                <option value="anadolu-bakir">Anadolu Bakır A.Ş.</option>
                <option value="demo-sirket">Demo Şirket</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Kullanıcı Adı</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                placeholder="Kullanıcı adınızı giriniz"
                className="w-full h-12 px-3 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Şifre</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Şifrenizi giriniz"
                  className="w-full h-12 px-3 pr-10 text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all mt-4"
              style={{ backgroundColor: "rgba(237, 124, 30)" }}
            >
              Giriş Yap
            </Button>
          </div>

          {/* Demo Bilgisi */}
          <div className="mt-8 pt-5 border-t border-gray-200">
            <p className="text-[10px] font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">Demo Hesaplar</p>
            <div className="space-y-1.5 text-[10px] text-gray-600">
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Talep Açan</span>
                <span className="text-gray-500">talep.acan / 123456</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Satınalmacı</span>
                <span className="text-gray-500">satinalma / 123456</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium">Admin</span>
                <span className="text-gray-500">admin / 123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Arka Plan Görseli */}
      <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent z-10"></div>
        <img
          src="/AB.jpeg"
          alt="Anadolu Bakır"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
