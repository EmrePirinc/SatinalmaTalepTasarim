import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"

// Carousel resimleri
const carouselImages = [
  "/AB.jpeg",
  "/AB2.jpg",
  "/AB3.jpg"
]

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
    <div className="flex h-screen bg-white">
      {/* Sol Taraf - Login Formu */}
      <div className="w-full lg:w-[40%] flex items-center justify-center bg-white p-8 sm:p-12">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4 mb-12">
              <img
                src="/AB_LOGO.png"
                alt="Anadolu Bakır"
                className="h-12 object-contain"
              />
              <div className="w-px h-10 bg-gray-200"></div>
              <img
                src="/OTTOCOOL_LOGO.png"
                alt="Ottocool"
                className="h-10 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-orange-500 mb-2 text-center">
              Hoş Geldiniz
            </h1>
            <p className="text-gray-500 text-sm text-center">Sisteme giriş yaparak devam edin</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wider">Şirket</label>
              <select
                value={company}
                onChange={(e) => {
                  setCompany(e.target.value)
                  setError("")
                }}
                className="w-full h-14 px-4 text-sm text-gray-700 border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-lg bg-white transition-all"
              >
                <option value="">Şirket seçiniz</option>
                <option value="anadolu-bakir">Anadolu Bakır A.Ş.</option>
                <option value="ottocool">Ottocool</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wider">Kullanıcı Adı</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError("")
                }}
                placeholder="Kullanıcı adınızı giriniz"
                className="w-full h-14 px-4 text-sm text-gray-700 border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-lg bg-white transition-all"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wider">Şifre</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError("")
                  }}
                  placeholder="Şifrenizi giriniz"
                  className="w-full h-14 px-4 pr-12 text-sm text-gray-700 border border-gray-200 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-lg bg-white transition-all"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
              className="w-full h-14 text-white text-base font-semibold rounded-lg transition-all duration-200 mt-6"
              style={{ backgroundColor: "#FF6B1A" }}
            >
              Giriş Yap
            </Button>
          </div>

          {/* Demo Bilgisi */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 mb-3 uppercase tracking-wider">Demo Hesaplar</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                <span className="font-medium text-gray-700">Talep Açan</span>
                <span className="text-gray-500 font-mono text-[10px]">talep.acan / 123456</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                <span className="font-medium text-gray-700">Satınalmacı</span>
                <span className="text-gray-500 font-mono text-[10px]">satinalma / 123456</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                <span className="font-medium text-gray-700">Admin</span>
                <span className="text-gray-500 font-mono text-[10px]">admin / 123456</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Carousel Arka Plan Görseli */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        {/* Nostaljik renk efekti - Mazi ve başarı */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-500/15 to-yellow-600/20 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-orange-800/20 z-10"></div>
        
        {/* Carousel Görselleri */}
        {carouselImages.map((image, index) => (
          <img
            key={image}
            src={image}
            alt={`Anadolu Bakır ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              filter: "sepia(15%) contrast(105%) brightness(95%)"
            }}
          />
        ))}
        
        {/* Alt overlay - Derinlik */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-20"></div>
        
        {/* Indicator dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Resim ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
