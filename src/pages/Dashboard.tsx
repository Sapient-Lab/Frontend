import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap, FiFileText, FiArrowRight, FiClock, FiUsers, FiCpu, FiDatabase } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';
// Importa tu imagen del robot
import robotIcon from '../assets/robot-icon.png'; 

type MemberStatus = 'online' | 'away';

interface Member {
  id: string;
  name: string;
  role: string;
  initials: string;
  status: MemberStatus;
}
interface PlatformMember {
  id: number | string;
  name?: string;
  username?: string;
  role?: string;
  status?: string;
}

type CurrentUser = { name: string; initials: string; role: string; id: string };

export default function Dashboard() {
  const navigate = useNavigate();
  const { projectMode, projectId } = useProject();
  const [aiMessage, setAiMessage] = useState('Bienvenido a tu Dashboard. Comienza a trabajar en tus proyectos.');
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string | number; time: string; text: string; user: string; color: string }>>(
    []
  );
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [user] = useState<CurrentUser | null>(() => {
    let localUser: CurrentUser = { name: 'Tú', initials: 'TU', role: 'Usuario', id: 'me' };
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const name = parsed.name || parsed.username || 'Tú';
        const initials = parsed.initials || name.substring(0, 2).toUpperCase();
        const role = parsed.role || 'Investigador';
        const id = parsed.id?.toString() || 'me';
        localUser = { name, initials, role, id };
      } catch {
        // fallback already set
      }
    }
    return localUser;
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (active) {
          setRecentActivity([
            { id: 'fallback-1', time: 'Ahora', text: 'Panel de Control cargado exitosamente', user: 'AI', color: 'from-accent to-cyan-500' },
          ]);
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard', error);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [projectId, projectMode]);

  useEffect(() => {
    let unmounted = false;
    const effectiveProjectId = projectId || (() => {
      const stored = localStorage.getItem('projectContext');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.id;
        } catch { return null; }
      }
      return null;
    })();

    const fetchMembers = async () => {
      let members: Member[] = [];
      if (user) {
        members.push({
          id: user.id || 'me',
          name: user.name,
          role: user.role || 'Investigador Principal',
          initials: user.initials,
          status: 'online'
        });
      }

      if (effectiveProjectId) {
        try {
          const response = await fetch(`/api/projects/${effectiveProjectId}/members`);
          if (response.ok) {
            const data = await response.json();
            const apiMembers = (data as PlatformMember[])
              .filter(m => String(m.id) !== String(user?.id))
              .map(m => {
                const name = m.name || m.username || 'Usuario';
                return {
                  id: String(m.id),
                  name,
                  role: m.role || 'Colaborador',
                  initials: name.substring(0, 2).toUpperCase(),
                  status: (m.status === 'active' ? 'online' : 'away') as MemberStatus
                };
              });
            members = [...members, ...apiMembers];
          }
        } catch (error) {
          console.error('[Dashboard] Fetch members error:', error);
        }
      }

      if (!unmounted) {
        setTeamMembers(members);
      }
    };

    if (user) {
      fetchMembers();
    }
    return () => {
      unmounted = true;
    };
  }, [projectId, user]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in relative bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020]">
      
      {/* Fondo con grid científico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.06)_1px,transparent_1px)] bg-[size:50px_50px] animate-grid-drift" />
      
      {/* Partículas flotantes */}
      {[...Array(35)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-gentle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(59,130,246,${Math.random() * 0.35 + 0.1}), rgba(139,92,246,${Math.random() * 0.2}))`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${Math.random() * 25 + 18}s`,
          }}
        />
      ))}
      
      {/* Efecto de glow que sigue al mouse */}
      <div 
        className="fixed w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.07), rgba(139,92,246,0.03), transparent 70%)',
          left: mousePosition.x - 250,
          top: mousePosition.y - 250,
        }}
      />
      
      {/* Moléculas decorativas */}
      <div className="absolute top-20 left-10 opacity-25 animate-float-slower pointer-events-none">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="7" fill="#3b82f6" fillOpacity="0.2" />
          <circle cx="40" cy="40" r="18" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.2" fill="none" />
          <circle cx="40" cy="40" r="30" stroke="#3b82f6" strokeWidth="0.5" strokeOpacity="0.12" fill="none" />
        </svg>
      </div>
      <div className="absolute bottom-20 right-10 opacity-25 animate-float-slower-delay pointer-events-none">
        <svg width="90" height="90" viewBox="0 0 90 90" fill="none">
          <circle cx="45" cy="45" r="6" fill="#8b5cf6" fillOpacity="0.2" />
          <circle cx="45" cy="45" r="14" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.15" fill="none" />
          <circle cx="45" cy="45" r="24" stroke="#a855f7" strokeWidth="0.5" strokeOpacity="0.1" fill="none" />
        </svg>
      </div>
      
      <div className="relative z-10">
        {/* Header con Robot Animado */}
        <div className="mb-8 flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Centro de Operaciones Científicas
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed font-mono">
              {projectMode === 'solo' 
                ? 'Asistente de cuaderno para razonar experimentos sin reemplazar el juicio científico. Aquí verás progreso, alertas y recomendaciones explicables.'
                : ''}
            </p>
          </div>
          
          {/* Robot Animado */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-full blur-xl animate-pulse-slow" />
            <img 
              src={robotIcon} 
              alt="Robot asistente"
              className="w-28 h-30 lg:w-28 lg:h-28 object-contain relative z-10 animate-float-robot hover:scale-110 transition-transform duration-500 cursor-pointer"
            />
            {/* Partículas alrededor del robot */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-accent rounded-full animate-ping" />
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 p-4 rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-sm stagger-in hover:border-accent/40 transition-all duration-300">
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            Este asistente apoya el razonamiento experimental, no sustituye la supervisión técnica ni decisiones clínicas. Cada recomendación debe validarse por el equipo.
          </p>
        </div>

        <div className="flex flex-col gap-6">

          {/* Fila 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Tarjeta IA */}
            <div className="lg:col-span-2 bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(59,130,246,0.2)] flex flex-col relative stagger-in hover:border-accent/50 transition-all duration-500" style={{ animationDelay: '90ms' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-purple-500 rounded-t-xl"></div>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                  <FiCpu className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-[11px] font-bold text-purple-400 uppercase tracking-widest font-mono">ASISTENTE IA</h2>
              </div>
              
              <p className="text-sm text-slate-300 leading-relaxed z-10 flex-1 font-mono">
                “{aiMessage}”
              </p>
              
              <button 
                onClick={() => navigate('/app/lab')}
                className="mt-4 bg-gradient-to-r from-accent to-purple-600 text-white text-xs font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 group hover:shadow-lg hover:shadow-accent/30 transition-all duration-300"
              >
                <FiZap className="w-3 h-3" />
                Abrir asistente para revisar evidencia
                <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Actividad Reciente */}
            <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)] flex flex-col stagger-in hover:border-purple-500/50 transition-all duration-500" style={{ animationDelay: '280ms' }}>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-purple-500/20">
                <FiClock className="w-3 h-3 text-purple-400" />
                <h2 className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider">
                  {projectMode === 'solo' ? 'Bitácora Reciente' : 'Actividad del Equipo'}
                </h2>
              </div>
              
              <div className="flex-1 space-y-4 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4 relative group/item">
                    {index !== recentActivity.length - 1 && (
                      <div className="absolute left-3.5 top-8 w-[1px] h-[calc(100%+4px)] bg-gradient-to-b from-purple-500/30 to-transparent"></div>
                    )}
                    
                    <div className={`w-7 h-7 rounded-sm bg-gradient-to-r ${activity.color} flex items-center justify-center text-[10px] font-bold text-white z-10 shrink-0 group-hover/item:scale-110 transition-transform duration-300 shadow-md`}>
                      {activity.user}
                    </div>
                    <div>
                      <p className="text-xs text-slate-300 leading-tight mb-1 group-hover/item:text-white transition-colors">{activity.text}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-medium py-2 rounded-lg hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 group/btn flex items-center justify-center gap-2">
                Ver todo el historial
                <FiArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Fila 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Accesos Directos */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Visión Mágica */}
              <div 
                onClick={() => navigate('/app/protocolos')}
                className="bg-[#0f1624]/80 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.2)] transition-all duration-500 cursor-pointer group flex flex-col items-start stagger-in hover:border-emerald-500/50 hover:-translate-y-1"
                style={{ animationDelay: '160ms' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FiFileText className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-100 mb-2">Visión Mágica</h2>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed font-mono">Interpreta protocolos y diagramas usando visión IA. Sube imágenes o manuales y obtén un análisis automático.</p>
                <button className="mt-auto bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium py-2 px-4 rounded-lg hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 flex items-center gap-2 group/btn">
                  Abrir visión mágica
                  <FiArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Centro de Tareas */}
              <div 
                onClick={() => navigate('/app/tareas')}
                className="bg-[#0f1624]/80 backdrop-blur-sm border border-orange-500/20 rounded-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(249,115,22,0.2)] transition-all duration-500 cursor-pointer group flex flex-col items-start stagger-in hover:border-orange-500/50 hover:-translate-y-1"
                style={{ animationDelay: '220ms' }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FiDatabase className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-100 mb-2">Centro de Tareas</h2>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed font-mono">Gestiona evidencia experimental, revisiones del agente y estado de aprobación por calidad y seguridad.</p>
                <button className="mt-auto bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium py-2 px-4 rounded-lg hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-300 flex items-center gap-2 group/btn">
                  Ver validaciones
                  <FiArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Equipo Conectado */}
            <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-pink-500/20 rounded-xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(236,72,153,0.15)] flex flex-col h-full stagger-in hover:border-pink-500/50 transition-all duration-500" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-2 mb-5 pb-2 border-b border-pink-500/20">
                <FiUsers className="w-3 h-3 text-pink-400" />
                <h2 className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-wider">
                  {projectMode === 'solo' ? 'Investigadores Conectados' : 'Equipo Conectado'}
                </h2>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {teamMembers.length > 0 ? teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3 group/member hover:bg-pink-500/5 p-2 rounded-lg transition-all duration-300">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30 flex items-center justify-center text-xs font-bold text-pink-300 group-hover/member:scale-110 transition-transform duration-300">
                        {member.initials}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f1624] ${member.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 leading-tight group-hover/member:text-pink-300 transition-colors">{member.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono leading-tight">{member.role}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <FiUsers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-mono">No hay miembros conectados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-18px) translateX(10px);
            opacity: 0.5;
          }
        }
        
        @keyframes grid-drift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 70px 70px;
          }
        }
        
        @keyframes float-slower {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(10px);
          }
        }
        
        @keyframes float-robot {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        
        .animate-grid-drift {
          animation: grid-drift 35s linear infinite;
        }
        
        .animate-float-slower {
          animation: float-slower 14s ease-in-out infinite;
        }
        
        .animate-float-slower-delay {
          animation: float-slower 16s ease-in-out infinite;
          animation-delay: -5s;
        }
        
        .animate-float-robot {
          animation: float-robot 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        
        @keyframes pageFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes cardLift {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .page-fade-in {
          animation: pageFadeIn 520ms ease-out both;
        }
        
        .stagger-in {
          animation: cardLift 500ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}