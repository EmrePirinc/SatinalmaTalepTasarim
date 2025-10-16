import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Package,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Shield,
} from "lucide-react"
import abLogo from "@/assets/AB_LOGO.png"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const [satinalmaOpen, setSatinalmaOpen] = useState(true)
  const [finansOpen, setFinansOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // localStorage'dan sidebar durumunu al, yoksa false (expanded)
    const saved = localStorage.getItem("sidebarCollapsed")
    return saved ? JSON.parse(saved) : false
  })
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [location.pathname])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    // Sidebar durumunu localStorage'a kaydet
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newState))
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isCollapsed ? "w-16" : "w-56"
        } fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 shadow-sm`}
      >
        {/* Logo & Collapse Toggle - Zwilling Style */}
        <div className="h-14 flex items-center justify-center px-3 border-b border-gray-100 bg-white relative">
          <div className="flex items-center justify-center">
            <img
              src={abLogo}
              alt="Anadolu Bakır"
              className={isCollapsed ? "h-6 object-contain" : "h-8 object-contain"}
            />
          </div>
          
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-6 h-6 items-center justify-center rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 absolute right-3"
              aria-label="Toggle sidebar collapse"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
          )}
          
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-6 h-6 items-center justify-center rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 absolute right-3"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          
          <button
            onClick={onToggle}
            className="md:hidden w-6 h-6 flex items-center justify-center rounded hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 absolute right-3"
            aria-label="Close sidebar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Menu - Zwilling Style */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {/* Anasayfa */}
            <Link to="/">
              <button
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-md hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-200 group relative text-sm`}
                title={isCollapsed ? "Anasayfa" : ""}
              >
                <Home className="w-4.5 h-4.5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Anasayfa</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Anasayfa
                  </div>
                )}
              </button>
            </Link>

            {/* Satınalma */}
            <div>
              <button
                onClick={() => !isCollapsed && setSatinalmaOpen(!satinalmaOpen)}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-sm`}
                title={isCollapsed ? "Satınalma" : ""}
              >
                <Package className="w-4.5 h-4.5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span>Satınalma</span>
                    {satinalmaOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 ml-auto transition-transform" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform" />
                    )}
                  </>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Satınalma
                  </div>
                )}
              </button>

              {/* Satınalma Alt Menü - Zwilling Style */}
              {satinalmaOpen && !isCollapsed && (
                <div className="pl-7 space-y-0.5 mt-1">
                  <Link to="/">
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        location.pathname === "/"
                          ? "text-white bg-orange-500"
                          : "hover:bg-gray-50 text-gray-600 hover:text-orange-600"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${
                          location.pathname === "/" ? "bg-white" : "bg-gray-400"
                        }`}
                      />
                      Satınalma Talep Formu
                    </button>
                  </Link>
                  <Link to="/talep-listesi">
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 ${
                        location.pathname === "/talep-listesi"
                          ? "text-white bg-orange-500"
                          : "hover:bg-gray-50 text-gray-600 hover:text-orange-600"
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${
                          location.pathname === "/talep-listesi" ? "bg-white" : "bg-gray-400"
                        }`}
                      />
                      Talep Listesi
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Finans */}
            <div>
              <button
                onClick={() => !isCollapsed && setFinansOpen(!finansOpen)}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-md hover:bg-orange-50 text-gray-600 hover:text-orange-600 transition-all duration-200 group relative text-sm`}
                title={isCollapsed ? "Finans" : ""}
              >
                <DollarSign className="w-4.5 h-4.5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">Finans</span>
                    {finansOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 ml-auto transition-transform" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform" />
                    )}
                  </>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Finans
                  </div>
                )}
              </button>

              {/* Finans Alt Menü */}
              {finansOpen && !isCollapsed && (
                <div className="pl-7 space-y-0.5 mt-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-gray-600 hover:text-orange-600 text-xs font-medium transition-all duration-200">
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                    Ödeme Süreci
                  </button>
                </div>
              )}
            </div>

            {/* Admin Paneli - Sadece Admin için */}
            {currentUser?.role === "admin" && (
              <Link to="/admin">
                <button
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                  } py-2.5 rounded-md transition-all duration-200 group relative text-sm ${
                    location.pathname === "/admin"
                      ? "text-white bg-orange-500"
                      : "hover:bg-orange-50 text-gray-600 hover:text-orange-600"
                  }`}
                  title={isCollapsed ? "Kullanıcı Yönetimi" : ""}
                >
                  <Shield className="w-4.5 h-4.5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">Kullanıcı Yönetimi</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Kullanıcı Yönetimi
                    </div>
                  )}
                </button>
              </Link>
            )}
          </div>
        </nav>
      </aside>
    </>
  )
}
