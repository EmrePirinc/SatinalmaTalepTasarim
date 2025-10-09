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
    <div className="flex h-screen">
      {/* Sol Taraf - Login Formu */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-12">
            <img
              src="/anadolubakır büyük harf.png"
              alt="Anadolu Bakır"
              className="h-24 mx-auto mb-8 object-contain"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Hoş Geldiniz</h1>
            <p className="text-gray-600 text-lg">Satınalma Yönetim Sistemine giriş yapın</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Kullanıcı Adı</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                placeholder="Kullanıcı adınızı giriniz"
                className="w-full h-12 px-4 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Şifre</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Şifrenizi giriniz"
                  className="w-full h-12 px-4 pr-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-12 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: "rgba(237, 124, 30)" }}
            >
              Giriş Yap
            </Button>
          </div>

          {/* Demo Bilgisi */}
          <div className="mt-8 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <p className="font-semibold text-gray-800 mb-3 text-sm">📌 Demo Kullanıcılar</p>
            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                <span className="text-lg">👤</span>
                <div>
                  <span className="font-semibold">Talep Açan:</span> talep.acan / 123456
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                <span className="text-lg">🛒</span>
                <div>
                  <span className="font-semibold">Satınalmacı:</span> satinalma / 123456
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                <span className="text-lg">⚙️</span>
                <div>
                  <span className="font-semibold">Admin:</span> admin / 123456
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Arka Plan Görseli */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-orange-700/30 z-10"></div>
        <img
          src="/chillventa-2018-anadolu-bakir-a-s.jpeg"
          alt="Anadolu Bakır"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 flex flex-col items-center justify-center text-white p-12 w-full bg-gradient-to-t from-black/60 via-black/40 to-transparent">
          <div className="max-w-lg text-center">
            <h2 className="text-5xl font-bold mb-6 drop-shadow-lg">
              Satınalma Süreçlerinizi
              <br />
              Dijitalleştirin
            </h2>
            <p className="text-xl text-white/95 leading-relaxed drop-shadow-md">
              Modern ve kullanıcı dostu arayüzü ile satınalma taleplerini yönetin,
              onaylayın ve takip edin.
            </p>
            <div className="mt-12 flex items-center justify-center gap-8">
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 min-w-[100px]">
                <div className="text-4xl font-bold mb-2">100%</div>
                <div className="text-sm text-white/90 font-medium">Dijital</div>
              </div>
              <div className="w-px h-16 bg-white/40"></div>
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 min-w-[100px]">
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-sm text-white/90 font-medium">Erişim</div>
              </div>
              <div className="w-px h-16 bg-white/40"></div>
              <div className="text-center backdrop-blur-sm bg-white/10 rounded-xl p-4 min-w-[100px]">
                <div className="text-4xl font-bold mb-2">Hızlı</div>
                <div className="text-sm text-white/90 font-medium">Onay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
