import { useState, useEffect, useMemo } from 'react';
import { FiMail, FiUsers, FiUserPlus, FiClock } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';
import robotIcon3 from '../assets/robot-icon3.png'; // Ajusta la ruta según donde tengas la imagen

type MemberStatus = 'active' | 'pending';
type Role = 'Administrador' | 'Colaborador' | 'Lector';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: Role;
  status: MemberStatus;
  color: string;
}

interface PendingInvitation {
  id: string;
  name: string;
  email: string;
}

export default function Team() {
  const { projectId, projectMode, setProjectMode } = useProject();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingInvitation[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    width: Math.random() * 3 + 1,
    height: Math.random() * 3 + 1,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity1: Math.random() * 0.3 + 0.1,
    opacity2: Math.random() * 0.15,
    delay: Math.random() * 15,
    duration: Math.random() * 20 + 15,
  })), []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toInitials = (nameOrEmail: string) =>
    nameOrEmail
      .split(' ')
      .map((part) => part.trim().charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NA';

  const getMemberColor = (index: number) => {
    const colors = ['from-accent to-purple-600', 'from-blue-600 to-cyan-600', 'from-emerald-600 to-teal-600', 'from-orange-600 to-amber-600', 'from-pink-600 to-rose-600'];
    return colors[index % colors.length];
  };

  const loadMembers = async () => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/members`);
    if (!response.ok) {
      throw new Error('No se pudieron obtener los miembros del proyecto');
    }

    const data = await response.json();
    const normalized = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    const mapped = normalized.map((member: any, index: number) => ({
      id: String(member.id),
      name: member.name || (member.email ? String(member.email).split('@')[0] : 'Integrante'),
      initials: toInitials(member.name || member.email),
      email: member.email,
      role: member.role === 'owner' || member.role === 'admin' ? 'Administrador' : 'Colaborador',
      status: 'active' as MemberStatus,
      color: getMemberColor(index),
    }));

    setMembers(mapped);
    setProjectMode(mapped.length > 1 ? 'team' : 'solo');
  };

  const loadPendingInvitations = async () => {
    if (!projectId) {
      setPendingRequests([]);
      return;
    }

    const response = await fetch(`/api/projects/${projectId}/invitations?status=pending`);
    if (!response.ok) {
      throw new Error('No se pudieron obtener las invitaciones pendientes');
    }

    const data = await response.json();
    const normalized = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

    setPendingRequests(
      normalized.map((inv: any) => ({
        id: String(inv.id),
        name: inv.name || (inv.email ? String(inv.email).split('@')[0] : 'Invitado'),
        email: inv.email,
      })),
    );
  };

  const reloadTeamData = async () => {
    try {
      await Promise.all([loadMembers(), loadPendingInvitations()]);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    reloadTeamData();
  }, [projectId]);

  const handleAcceptRequest = async (reqId: string) => {
    if (!projectId) return;
    try {
      const req = pendingRequests.find(r => r.id === reqId);
      if (!req) return;

      const response = await fetch(`/api/projects/${projectId}/invitations/${reqId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: req.name })
      });

      if (!response.ok) {
        throw new Error('No se pudo aceptar la invitacion');
      }

      await reloadTeamData();
    } catch (e) {
      console.error(e);
      alert('Error aceptando solicitud');
    }
  };

  const handleDeclineRequest = async (reqId: string) => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/invitations/${reqId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('No se pudo rechazar la invitacion');
      }

      await reloadTeamData();
    } catch (e) {
      console.error(e);
      alert('Error rechazando solicitud');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !projectId || isSubmittingInvite) return;

    setIsSubmittingInvite(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), invitedByUserId: 1 }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'No se pudo crear la invitacion');
      }

      setInviteEmail('');
      await reloadTeamData();
      alert('Invitacion enviada correctamente');
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Error al crear la invitacion');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const removeMember = (id: string) => {
    const updated = members.filter(m => m.id !== id);
    setMembers(updated);
    if (updated.length === 1) {
      setProjectMode('solo');
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 relative bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020]">
      
      {/* Fondo con grid científico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Partículas flotantes suaves */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-gentle"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `radial-gradient(circle, rgba(59,130,246,${p.opacity1}), rgba(139,92,246,${p.opacity2}))`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      
      {/* Efecto de glow que sigue al mouse */}
      <div 
        className="fixed w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.07), rgba(139,92,246,0.03), transparent 70%)',
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
      />
      
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        
        {/* Header con Robots en Equipo */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Gestión de Equipo
                </h1>
                <p className="text-xs font-mono text-accent tracking-wider">COLABORACIÓN CIENTÍFICA</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-mono mt-1">
              {projectMode === 'solo' 
                ? 'Actualmente estás trabajando en modo individual. Invita a otros para colaborar en tu entorno de laboratorio.'
                : 'Administra los accesos y roles de los miembros de tu proyecto.'}
            </p>
          </div>
          
          {/* Robots en Equipo */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-full blur-xl animate-pulse-slow" />
            <img 
              src={robotIcon3} 
              alt="Robots colaborando en equipo"
              className="w-80 h-80 lg:w-40 lg:h-40 object-contain relative z-10 animate-float-robot hover:scale-110 transition-transform duration-500 cursor-pointer"
            />
            <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <div className="absolute -bottom-1 left-3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <div className="absolute top-1/2 -left-1 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Invitación - estilo científico */}
          <div className="lg:col-span-1">
            <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-6 shadow-lg hover:shadow-2xl hover:border-accent/50 transition-all duration-500 sticky top-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Invitar Miembro</h3>
                  <span className="text-[9px] font-mono text-slate-500">Solo usuarios con proyectos individuales</span>
                </div>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-semibold text-accent mb-2 uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colega@universidad.edu"
                    className="w-full px-4 py-2.5 bg-[#0a0f1c] border border-accent/20 rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-slate-200 placeholder:text-slate-600 transition-all"
                    required
                  />
                  <p className="text-[9px] font-mono text-slate-500 mt-2 leading-relaxed flex items-start gap-1.5">
                    <FiMail className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>La invitación será enviada al correo. El usuario debe aceptarla para unirse al proyecto.</span>
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="w-full py-2.5 bg-gradient-to-r from-accent to-purple-600 text-white text-xs font-mono font-medium rounded-lg hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 disabled:opacity-60"
                >
                  {isSubmittingInvite ? 'Enviando...' : 'Enviar Invitación'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Miembros */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-accent/20">
                <h3 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                  <FiUsers className="w-3 h-3" />
                  Miembros Actuales ({members.length})
                </h3>
                {projectMode === 'solo' && (
                  <span className="bg-orange-500/10 border border-orange-500/30 text-orange-400 px-2 py-0.5 rounded-full text-[9px] font-mono">Modo Solo</span>
                )}
                {projectMode === 'team' && (
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-mono">Modo Equipo</span>
                )}
              </div>

              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-all duration-300 border border-transparent hover:border-accent/20 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        {member.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-100">{member.name}</p>
                          {member.status === 'pending' && (
                            <span className="text-[9px] bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-1.5 py-0.5 rounded-full font-mono">Pendiente</span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-mono text-slate-400 bg-accent/10 px-2 py-1 rounded">
                        {member.role}
                      </span>
                      
                      {member.name !== 'Tú' && (
                        <button 
                          onClick={() => removeMember(member.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                          title="Eliminar miembro"
                        >
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {members.length === 0 && (
                <div className="mt-6 p-8 border-2 border-dashed border-accent/20 rounded-xl flex flex-col items-center justify-center text-center bg-accent/5">
                  <FiUsers className="w-12 h-12 mb-3 opacity-50 text-accent" />
                  <p className="text-sm font-semibold text-slate-300">No hay miembros en el equipo</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-1 max-w-xs">Utiliza el formulario de la izquierda para invitar colaboradores y potenciar tu investigación.</p>
                </div>
              )}
            </div>

            {/* Panel de Solicitudes Entrantes */}
            <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-accent/20">
                <h3 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                  <FiClock className="w-3 h-3" />
                  Solicitudes de unión ({pendingRequests.length})
                </h3>
                {pendingRequests.length > 0 && (
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full text-[9px] font-mono">Nuevas</span>
                )}
              </div>

              <div className="space-y-3">
                {pendingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <FiUserPlus className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-xs font-mono text-slate-500 text-center">No tienes solicitudes pendientes.</p>
                  </div>
                ) : (
                  pendingRequests.map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg gap-4 hover:bg-accent/10 transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {req.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-100">{req.name}</p>
                          <p className="text-[10px] font-mono text-slate-500">{req.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-accent to-purple-600 text-white text-[10px] font-mono font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3 py-1.5 bg-transparent border border-red-500/50 text-red-400 text-[10px] font-mono font-semibold rounded-lg hover:bg-red-500/10 transition-all duration-300"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))
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
            transform: translateY(-15px) translateX(8px);
            opacity: 0.5;
          }
        }
        
        @keyframes float-robot {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1deg);
          }
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
        
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        
        .animate-float-robot {
          animation: float-robot 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}