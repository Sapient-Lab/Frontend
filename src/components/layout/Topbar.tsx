import { useNavigate, useLocation } from 'react-router-dom'
import { FiActivity, FiLogOut } from 'react-icons/fi'
import type { NavItem } from '../../types/navigation'

const navItems: NavItem[] = [
  { label: 'Laboratorio', path: '/app/lab' },
  { label: 'Tareas', path: '/app/tareas' },
  { label: 'Docs', path: '/app/docs' },
  { label: 'Equipo', path: '/app/equipo' },
]

export default function Topbar() {
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()

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

  const handleLogout = () => {
    sessionStorage.removeItem('active_session');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="h-[64px] bg-[#0f1624]/90 backdrop-blur-xl border-b border-accent/20 flex items-center px-3 sm:px-4 lg:px-6 gap-3 lg:gap-6 sticky top-0 z-50 transition-all duration-300">
      
      {/* Brand */}
      <div
        onClick={() => navigate('/app')}
        className="flex shrink-0 items-center gap-3 font-semibold text-[15px] cursor-pointer group transition-all duration-300"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <FiActivity className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-bold text-base bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            SapientLab
          </p>
          <p className="hidden md:block text-[9px] font-mono text-accent tracking-[0.2em] uppercase">
            Notebook Assistant
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex gap-1 flex-1 min-w-0 overflow-x-auto whitespace-nowrap pr-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.path)
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`shrink-0 px-4 py-2 rounded-lg text-[12px] font-mono font-medium transition-all duration-300 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-accent to-purple-600 text-white shadow-lg shadow-accent/30'
                  : 'text-slate-400 hover:text-accent hover:bg-accent/10'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Right Section - Card de Usuario */}
      <div className="shrink-0 flex items-center gap-3 md:gap-4">
        
        {/* Session Status */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-[9px] font-mono uppercase tracking-wider">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-accent">Session segura</span>
        </div>

        {/* User Card - Estilo tarjeta pequeña */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/30 to-purple-500/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300" />
          <div className="relative flex items-center gap-3 px-3 py-1.5 rounded-xl bg-accent/5 border border-accent/20 hover:border-accent/50 transition-all duration-300">
            
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              {userInitials}
            </div>
            
            {/* User Info */}
            <div className="hidden 2xl:flex flex-col">
              <span className="text-[10px] font-mono text-slate-300">{userEmail}</span>
              <span className="text-[8px] font-mono text-slate-500">Investigador</span>
            </div>
            
            {/* Logout Button dentro de la card */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 group/btn"
              title="Cerrar sesión"
            >
              <FiLogOut className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </header>
  )
}