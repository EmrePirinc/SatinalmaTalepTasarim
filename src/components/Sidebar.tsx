import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Package,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
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
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!isCollapsed && (
            <div className="text-xl font-bold" style={{ color: "rgba(237, 124, 30)" }}>
              ANADOLU BAKIR
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onToggle}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-4 mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                ANADOLU BAKIR
              </div>
            </div>
          )}

          <div className="space-y-1 px-2">
            {/* Anasayfa */}
            <Link to="/">
              <button
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center px-2" : "gap-3 px-3"
                } py-2.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-all duration-200 group relative`}
                title={isCollapsed ? "Anasayfa" : ""}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Anasayfa</span>}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
                } py-2.5 rounded-md text-sm font-medium transition-all duration-200 group relative`}
                style={{ backgroundColor: "rgba(237, 124, 30, 0.1)", color: "rgba(237, 124, 30)" }}
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
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
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
          </div>
        </nav>

        {/* Collapse Toggle Button - Bottom */}
        {!isCollapsed && (
          <div className="hidden md:block p-4 border-t border-sidebar-border">
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground text-sm transition-colors"
            >
              <Menu className="w-4 h-4" />
              <span>Daralt</span>
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
