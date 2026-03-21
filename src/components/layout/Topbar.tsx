import { useNavigate, useLocation } from 'react-router-dom'
import type { NavItem } from '../../types/navigation'

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

  return (
    <header className="h-[52px] bg-surface border-b border-lab-border flex items-center px-6 gap-8 sticky top-0 z-50">

      {/* Brand */}
      <div 
        onClick={() => navigate('/app')}
        className="flex items-center gap-2.5 font-semibold text-[15px] text-accent tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
            <rect x="9" y="4" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
            <rect x="2" y="11" width="5" height="2" rx="1" fill="white" opacity="0.6"/>
            <rect x="9" y="11" width="5" height="2" rx="1" fill="white" opacity="0.4"/>
          </svg>
        </div>
        SapientLab
      </div>

      {/* Nav */}
      <nav className="flex gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3.5 py-1.5 rounded-md text-[13px] transition-all cursor-pointer border-none
                ${isActive
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-muted hover:bg-lab-bg hover:text-gray-800'
                }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="w-[30px] h-[30px] bg-accent rounded-full flex items-center justify-center text-white text-xs font-semibold">
          FC
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="ml-2 text-[12px] font-mono text-muted hover:text-accent underline transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

    </header>
  )
}