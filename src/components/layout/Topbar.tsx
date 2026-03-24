import { useNavigate, useLocation } from 'react-router-dom'
import { FiMoon, FiSun } from 'react-icons/fi'
import type { NavItem } from '../../types/navigation'
import { useTheme } from '../../context/ThemeContext'

const navItems: NavItem[] = [
  { label: 'Laboratorio', path: '/app/lab' },
  { label: 'Equipo', path: '/app/equipo' },
  { label: 'Resultados', path: '/app/resultados' },
  // { label: 'Reportes IA', path: '/app/reportes' },
  { label: 'Tareas', path: '/app/tareas' },
  { label: 'Docs', path: '/app/docs' },
]

export default function Topbar() {
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()

  let userEmail = 'usuario@email.com';
  let userInitials = 'FC';
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.email) userEmail = user.email;
      if (user.name) userInitials = user.name.substring(0, 2).toUpperCase();
    }
  } catch (error) {
    console.error('No se pudo leer el usuario de localStorage', error);
  }

  return (
    <header className={`h-[64px] backdrop-blur-md border-b flex items-center px-3 sm:px-4 lg:px-6 gap-3 lg:gap-6 sticky top-0 z-50 transition-colors ${
      isDark
        ? 'bg-[#0d1726]/92 border-[#223349]'
        : 'bg-white/90 border-lab-border/70'
    }`}>

      {/* Brand */}
      <div
        onClick={() => navigate('/app')}
        className="flex shrink-0 items-center gap-3 font-semibold text-[15px] text-accent tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
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
          <p className="hidden md:block text-[10px] text-muted tracking-[0.18em] uppercase">Notebook Assistant</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex gap-1 flex-1 min-w-0 overflow-x-auto whitespace-nowrap pr-1">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-[13px] transition-all cursor-pointer border border-transparent
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
      <div className="shrink-0 flex items-center gap-2 md:gap-3">
        <button
          onClick={toggleTheme}
          className="h-[32px] px-3 rounded-full border border-lab-border bg-lab-bg text-[12px] font-medium text-muted hover:text-accent hover:border-accent/40 transition-colors flex items-center gap-2"
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          <span className="hidden sm:inline">{isDark ? 'Claro' : 'Oscuro'}</span>
        </button>

        <div className={`hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full border border-lab-border bg-lab-bg text-[10px] uppercase tracking-widest ${
          isDark ? 'text-blue-100' : 'text-gray-600'
        }`}>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          Session segura
        </div>

        <div className="hidden 2xl:flex flex-col items-end mr-1">
          <span className={`text-[11px] font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{userEmail}</span>
        </div>
        <div className="w-[32px] h-[32px] bg-accent rounded-full flex items-center justify-center text-white text-xs font-semibold">
          {userInitials}
        </div>
        <button 
          onClick={() => {
            sessionStorage.removeItem('active_session');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="hidden md:inline ml-1 text-[12px] font-mono text-muted hover:text-accent underline transition-colors"
        >
          Cerrar sesión
        </button>
        <button
          onClick={() => {
            sessionStorage.removeItem('active_session');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="md:hidden text-[11px] font-mono text-muted hover:text-accent transition-colors"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </div>

    </header>
  )
}