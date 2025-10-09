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

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const [satinalmaOpen, setSatinalmaOpen] = useState(true)
  const [finansOpen, setFinansOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
  }, [location.pathname])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
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
          isCollapsed ? "w-16" : "w-64"
        } fixed md:static inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out md:translate-x-0`}
      >
        {/* Logo & Collapse Toggle */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border bg-white">
          {!isCollapsed ? (
            <>
              <img
                src="/AB_LOGO.png"
                alt="Anadolu Bakır"
                className="h-9 object-contain"
              />
              <button
                onClick={toggleCollapse}
                className="hidden md:flex w-7 h-7 items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 ml-auto"
                aria-label="Toggle sidebar collapse"
              >
                <Menu className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleCollapse}
              className="hidden md:flex w-full items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors py-2"
              aria-label="Toggle sidebar collapse"
            >
              <img
                src="/AB_LOGO.png"
                alt="Anadolu Bakır"
                className="h-7 object-contain"
              />
            </button>
          )}
          <button
            onClick={onToggle}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-2 px-3">
            {/* Anasayfa */}
            <Link to="/">
              <button
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                } py-3 rounded-lg hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-all duration-200 group relative`}
                title={isCollapsed ? "Anasayfa" : ""}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-semibold">Anasayfa</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
                  isCollapsed ? "justify-center px-2" : "gap-3 px-4"
                } py-3 rounded-lg text-sm font-semibold transition-all duration-200 group relative bg-orange-500 text-white hover:bg-orange-600 shadow-sm`}
                title={isCollapsed ? "Satınalma" : ""}
              >
                <Package className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span>Satınalma</span>
                    {satinalmaOpen ? (
                      <ChevronDown className="w-4 h-4 ml-auto transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto transition-transform" />
                    )}
                  </>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Satınalma
                  </div>
                )}
              </button>

              {/* Satınalma Alt Menü */}
              {satinalmaOpen && !isCollapsed && (
                <div className="pl-8 space-y-1 mt-1">
                  <Link to="/">
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        location.pathname === "/"
                          ? "text-white"
                          : "hover:bg-sidebar-accent text-sidebar-foreground"
                      }`}
                      style={
                        location.pathname === "/"
                          ? { backgroundColor: "rgba(237, 124, 30)" }
                          : undefined
                      }
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          location.pathname === "/" ? "bg-white" : "bg-muted-foreground"
                        }`}
                      />
                      Satınalma Talep Formu
                    </button>
                  </Link>
                  <Link to="/talep-listesi">
                    <button
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        location.pathname === "/talep-listesi"
                          ? "text-white"
                          : "hover:bg-sidebar-accent text-sidebar-foreground"
                      }`}
                      style={
                        location.pathname === "/talep-listesi"
                          ? { backgroundColor: "rgba(237, 124, 30)" }
                          : undefined
                      }
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          location.pathname === "/talep-listesi" ? "bg-white" : "bg-muted-foreground"
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
                } py-2.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-all duration-200 group relative`}
                title={isCollapsed ? "Finans" : ""}
              >
                <DollarSign className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium">Finans</span>
                    {finansOpen ? (
                      <ChevronDown className="w-4 h-4 ml-auto transition-transform" />
                    ) : (
                      <ChevronRight className="w-4 h-4 ml-auto transition-transform" />
                    )}
                  </>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Finans
                  </div>
                )}
              </button>

              {/* Finans Alt Menü */}
              {finansOpen && !isCollapsed && (
                <div className="pl-8 space-y-1 mt-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm font-medium transition-all duration-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
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
                  } py-2.5 rounded-md transition-all duration-200 group relative ${
                    location.pathname === "/admin"
                      ? "text-white"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  }`}
                  style={
                    location.pathname === "/admin"
                      ? { backgroundColor: "rgba(237, 124, 30)" }
                      : undefined
                  }
                  title={isCollapsed ? "Admin Paneli" : ""}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">Admin Paneli</span>}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Admin Paneli
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
