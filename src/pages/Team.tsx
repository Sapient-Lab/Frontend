import { useState, useEffect } from 'react';
import { FiMail, FiUsers } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';

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

export default function Team() {
  const { projectId, projectMode, setProjectMode } = useProject();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  const [pendingRequests, setPendingRequests] = useState<{id: string, name: string, email: string}[]>([]);

  // Fetch miembros actuales y solicitudes pendientes desde el backend real
  useEffect(() => {
    const localUser = () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const name = parsed.name || parsed.username || 'Tú';
          return {
            id: parsed.id ? String(parsed.id) : 'me',
            name,
            initials: name.substring(0, 2).toUpperCase(),
            email: parsed.email || 'usuario@sapientlab.dev',
            role: 'Administrador' as Role,
            status: 'active' as MemberStatus,
            color: 'bg-accent',
          };
        }
      } catch (e) {
        console.error('Error leyendo user local', e);
      }
      return {
        id: 'me',
        name: 'Tú',
        initials: 'TU',
        email: 'tu@email.com',
        role: 'Administrador' as Role,
        status: 'active' as MemberStatus,
        color: 'bg-accent',
      };
    };

    const loadMembers = async () => {
      const base = localUser();
      let list: TeamMember[] = [base];

      if (projectId) {
        try {
          const res = await fetch(`http://localhost:3000/api/platform/projects/${projectId}/members`);
          if (res.ok) {
            const data = await res.json();
            const mapped = data.map((m: any, idx: number) => {
              const name = m.name || m.username || 'Miembro';
              return {
                id: String(m.id),
                name,
                initials: name.substring(0, 2).toUpperCase(),
                email: m.email || 'sin-correo@lab.dev',
                role: (m.role || 'Colaborador') as Role,
                status: (m.status === 'active' ? 'active' : 'pending') as MemberStatus,
                color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'][idx % 4],
              };
            });
            // Evitar duplicar al usuario local si ya vino del backend
            list = [base, ...mapped.filter((m: TeamMember) => m.id !== base.id)];
            if (mapped.length > 0) setProjectMode('team');
          }
        } catch (e) {
          console.error('Error cargando miembros', e);
        }
      }

      setMembers(list);
    };

    const loadRequests = async () => {
      if (!projectId) return;
      try {
        const res = await fetch(`http://localhost:3000/api/platform/projects/${projectId}/requests`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPendingRequests(data.map((d: any) => ({ id: String(d.id), name: d.name, email: d.email })));
          }
        }
      } catch (e) {
        console.error('Error cargando solicitudes', e);
      }
    };

    loadMembers();
    loadRequests();
  }, [projectId, setProjectMode]);

  const handleAcceptRequest = async (reqId: string) => {
    if (!projectId) return;
    try {
      await fetch(`http://localhost:3000/api/platform/projects/${projectId}/requests/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(reqId), action: 'accept' })
      });
      const req = pendingRequests.find(r => r.id === reqId);
      if (!req) return;
      setPendingRequests(pendingRequests.filter(r => r.id !== reqId));
      setMembers([...members, {
        id: Date.now().toString(),
        name: req.name,
        initials: req.name.substring(0, 2).toUpperCase(),
        email: req.email,
        role: 'Colaborador',
        status: 'active',
        color: 'bg-green-600'
      }]);
      setProjectMode('team');
    } catch (e) {
      console.error(e);
      alert('Error aceptando solicitud');
    }
  };

  const handleDeclineRequest = async (reqId: string) => {
    if (!projectId) return;
    try {
      await fetch(`http://localhost:3000/api/platform/projects/${projectId}/requests/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(reqId), action: 'reject' })
      });
      setPendingRequests(pendingRequests.filter(r => r.id !== reqId));
    } catch (e) {
      console.error(e);
      alert('Error rechazando solicitud');
    }
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    alert(`¡Solicitud enviada! Se ha enviado una notificación a ${inviteEmail} para que acepte unirse al proyecto.`);

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      initials: inviteEmail.substring(0, 2).toUpperCase(),
      email: inviteEmail,
      role: 'Colaborador',
      status: 'pending',
      color: 'bg-gray-400'
    };

    setMembers([...members, newMember]);
    setInviteEmail('');
    
    // Si estaba en modo solo y acaba de invitar a alguien, lo pasamos a equipo
    if (projectMode === 'solo') {
      setProjectMode('team');
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
    <div className="h-full w-full overflow-y-auto bg-[#fbfbfb] p-8 lg:p-10 flex justify-center">
      <div className="w-full max-w-4xl">
        
        {/* Cabecera */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
            Gestión de Equipo
          </h1>
          <p className="text-sm text-gray-500">
            {projectMode === 'solo' 
              ? 'Actualmente estás trabajando en modo individual. Invita a otros para colaborar en tu entorno de laboratorio.'
              : 'Administra los accesos y roles de los miembros de tu proyecto.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulario de Invitación */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm sticky top-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center text-xl">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">Invitar Miembro</h3>
                  <span className="text-[10px] text-gray-500">Añadir al laboratorio</span>
                </div>
              </div>

              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="colega@universidad.edu"
                    className="w-full px-3 py-2 border border-lab-border rounded-lg text-sm focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dim transition-colors shadow-sm"
                >
                  Enviar Invitación
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Miembros */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm">
              <h3 className="text-[13px] font-bold uppercase text-gray-400 tracking-wider mb-4 border-b border-gray-100 pb-3 flex justify-between">
                <span>Miembros Actuales ({members.length})</span>
                {projectMode === 'solo' && <span className="bg-orange-100 text-orange-700 px-2 rounded-full normal-case text-[10px] flex items-center">Modo Solo</span>}
                {projectMode === 'team' && <span className="bg-blue-100 text-blue-700 px-2 rounded-full normal-case text-[10px] flex items-center">Modo Equipo</span>}
              </h3>

              <div className="space-y-4">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${member.color}`}>
                        {member.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-800">{member.name}</p>
                          {member.status === 'pending' && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full font-medium">Pendiente</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-mono">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {member.role}
                      </span>
                      
                      {member.name !== 'Tú' && (
                        <button 
                          onClick={() => removeMember(member.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Eliminar miembro"
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {projectMode === 'solo' && (
                <div className="mt-8 p-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center bg-gray-50/50">
                  <FiUsers className="w-10 h-10 mb-3 opacity-70 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-600">No hay nadie más por aquí</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">Utiliza el formulario de la izquierda para invitar colaboradores y potenciar tu investigación.</p>
                </div>
              )}

            </div>

            {/* Panel de Solicitudes Entrantes */}
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm mt-8">
              <h3 className="text-[13px] font-bold uppercase text-gray-400 tracking-wider mb-4 border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>Solicitudes de unión ({pendingRequests.length})</span>
                {pendingRequests.length > 0 && <span className="bg-red-100 text-red-700 px-2 rounded-full normal-case text-[10px] flex items-center shadow-sm">Nuevas</span>}
              </h3>

              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm font-medium text-gray-400 text-center py-4">No tienes solicitudes pendientes.</p>
                ) : (
                  pendingRequests.map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                          {req.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{req.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{req.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptRequest(req.id)}
                          className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded hover:bg-accent-dim transition-colors"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(req.id)}
                          className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs font-semibold rounded hover:bg-red-50 hover:text-red-600 transition-colors"
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
    </div>
  );
}