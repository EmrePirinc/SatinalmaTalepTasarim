import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import abLogo from "@/assets/AB_LOGO.png"
import ottocoolLogo from "@/assets/OTTOCOOL_LOGO.png"
import ab1 from "@/assets/AB.jpeg"
import ab2 from "@/assets/AB2.jpg"
import ab3 from "@/assets/AB3.jpg"

// Carousel resimleri
const carouselImages = [ab1, ab2, ab3]

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Otomatik resim değişimi
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
    }, 5000) // 5 saniyede bir değişir

    return () => clearInterval(interval)
  }, [])

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
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sol Taraf - Login Formu */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        {/* Animated Pastel Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 animate-gradient-slow"></div>

        {/* Floating Shapes - Subtle Animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl animate-float-delayed"></div>

        {/* Content */}
        <div className="w-full max-w-[440px] relative z-10 animate-fade-in-up">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-12 group">
              <img
                src={abLogo}
                alt="Anadolu Bakır"
                className="h-12 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
              />
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
              <img
                src={ottocoolLogo}
                alt="Ottocool"
                className="h-10 object-contain transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent mb-3 text-center animate-fade-in">
              Hoş Geldiniz
            </h1>
            <p className="text-gray-600 text-sm text-center animate-fade-in-delayed">Sisteme giriş yaparak devam edin</p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="group">
              <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wider transition-colors group-focus-within:text-orange-600">
                Şirket
              </label>
              <select
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value)
                  setError("")
                }}
                className="w-full h-14 px-4 text-sm text-gray-700 border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md cursor-pointer"
              >
                <option value="">Şirket seçiniz</option>
                <option value="anadolu-bakir">Anadolu Bakır A.Ş.</option>
                <option value="ottocool">Ottocool</option>
              </select>
            </div>

            <div className="group">
              <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wider transition-colors group-focus-within:text-orange-600">
                Kullanıcı Adı
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                placeholder="Kullanıcı adınızı giriniz"
                className="w-full h-14 px-4 text-sm text-gray-700 border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="group">
              <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wider transition-colors group-focus-within:text-orange-600">
                Şifre
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Şifrenizi giriniz"
                  className="w-full h-14 px-4 pr-12 text-sm text-gray-700 border-2 border-gray-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-orange-300 hover:shadow-md"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 animate-shake">
                <span className="text-red-500 animate-pulse">⚠️</span>
                {error}
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full h-14 text-white text-base font-semibold rounded-xl transition-all duration-300 mt-6 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
              style={{ backgroundColor: "#FF6B1A" }}
            >
              <span className="relative z-10">Giriş Yap</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Button>
          </div>

          {/* Demo Bilgisi */}
          <div className="mt-10 pt-6 border-t border-gray-200/50">
            <p className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              Demo Hesaplar
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between py-2.5 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:border-orange-200 hover:scale-[1.02] cursor-pointer group">
                <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Talep Açan</span>
                <span className="text-gray-500 font-mono text-[10px] group-hover:text-gray-700 transition-colors">talep.acan / 123456</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:border-orange-200 hover:scale-[1.02] cursor-pointer group">
                <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Satınalmacı</span>
                <span className="text-gray-500 font-mono text-[10px] group-hover:text-gray-700 transition-colors">satinalma / 123456</span>
              </div>
              <div className="flex items-center justify-between py-2.5 px-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 transition-all duration-300 hover:bg-white hover:shadow-md hover:border-orange-200 hover:scale-[1.02] cursor-pointer group">
                <span className="font-medium text-gray-700 group-hover:text-orange-600 transition-colors">Admin</span>
                <span className="text-gray-500 font-mono text-[10px] group-hover:text-gray-700 transition-colors">admin / 123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Carousel Arka Plan Görseli */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        {/* Modern Gradient Overlay - Soft & Elegant */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/30 via-amber-300/20 to-yellow-400/25 z-10 animate-gradient-shift"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-amber-600/15 z-10"></div>

        {/* Carousel Görselleri - Smooth Transitions with Ken Burns Effect */}
        {carouselImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Anadolu Bakır ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-1500 ease-in-out ${
              index === currentImageIndex
                ? "opacity-100 animate-ken-burns"
                : "opacity-0 scale-110"
            }`}
            style={{
              filter: "sepia(10%) contrast(102%) brightness(97%) saturate(110%)"
            }}
          />
        ))}

        {/* Bottom Gradient - Enhanced Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl z-5 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl z-5 animate-pulse-slower"></div>

        {/* Brand Info Card - Floating */}
        <div className="absolute top-10 right-10 z-30 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 animate-float-gentle">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <span className="text-white text-lg font-bold">AB</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Anadolu Bakır</h3>
              <p className="text-white/70 text-xs">Excellence in Manufacturing</p>
            </div>
          </div>
        </div>

        {/* Indicator dots - Enhanced */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`rounded-full transition-all duration-500 hover:scale-110 ${
                index === currentImageIndex
                  ? "bg-white w-8 h-2 shadow-lg"
                  : "bg-white/40 w-2 h-2 hover:bg-white/70"
              }`}
              aria-label={`Resim ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
