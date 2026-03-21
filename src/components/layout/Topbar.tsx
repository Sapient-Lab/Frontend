import { useNavigate, useLocation } from 'react-router-dom'
import { FiMoon, FiSun } from 'react-icons/fi'
import type { NavItem } from '../../types/navigation'
import { useTheme } from '../../context/ThemeContext'

const navItems: NavItem[] = [
  { label: 'Laboratorio', path: '/app/lab' },
  { label: 'Equipo', path: '/app/equipo' },
  { label: 'Protocolos', path: '/app/protocolos' },
  { label: 'Resultados', path: '/app/resultados' },
  { label: 'Tareas', path: '/app/tareas' },
  { label: 'Docs', path: '/app/docs' },
]

export default function Topbar() {
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className={`h-[64px] backdrop-blur-md border-b flex items-center px-6 gap-8 sticky top-0 z-50 transition-colors ${
      isDark
        ? 'bg-[#0d1726]/92 border-[#223349]'
        : 'bg-white/90 border-lab-border/70'
    }`}>

      {/* Brand */}
      <div 
        onClick={() => navigate('/app')}
        className="flex items-center gap-3 font-semibold text-[15px] text-accent tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-[#123155] flex items-center justify-center shadow-[0_8px_20px_rgba(20,65,110,0.25)]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
            <rect x="9" y="4" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
            <rect x="2" y="11" width="5" height="2" rx="1" fill="white" opacity="0.6"/>
            <rect x="9" y="11" width="5" height="2" rx="1" fill="white" opacity="0.4"/>
          </svg>
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-sm">SapientLab</p>
          <p className="text-[10px] text-muted tracking-[0.18em] uppercase">Notebook Assistant</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3.5 py-2 rounded-lg text-[13px] transition-all cursor-pointer border border-transparent
                ${isActive
                  ? 'bg-accent-light text-accent font-medium border-accent/20 shadow-[inset_0_0_0_1px_rgba(28,61,107,0.08)]'
                  : `text-muted hover:bg-lab-bg ${isDark ? 'hover:text-blue-100' : 'hover:text-gray-800'}`
                }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="h-[32px] px-3 rounded-full border border-lab-border bg-lab-bg text-[12px] font-medium text-muted hover:text-accent hover:border-accent/40 transition-colors flex items-center gap-2"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          {isDark ? 'Claro' : 'Oscuro'}
        </button>

        <div className={`hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full border border-lab-border bg-lab-bg text-[10px] uppercase tracking-widest ${
          isDark ? 'text-blue-100' : 'text-gray-600'
        }`}>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          Session segura
        </div>

        <div className="w-[32px] h-[32px] bg-accent rounded-full flex items-center justify-center text-white text-xs font-semibold">
          FC
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="ml-1 text-[12px] font-mono text-muted hover:text-accent underline transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

    </header>
  )
}