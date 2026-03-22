import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';

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

export default function TeamPanel() {
  const { projectMode, projectId } = useProject();
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const { isDark } = useTheme();
  const [open, setOpen] = useState(true);
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
    // Si no hay projectId en el contexto, intentar leerlo desde localStorage
    const effectiveProjectId = projectId || (() => {
      const saved = localStorage.getItem('sapientlab_project_id');
      return saved ? parseInt(saved, 10) : null;
    })();
    
    console.log('[TeamPanel] Effect triggered. projectId (context):', projectId, 'effectiveProjectId:', effectiveProjectId, 'user:', user);
    
    const fetchMembers = async () => {
      let members: Member[] = [];

      if (effectiveProjectId) {
        console.log('[TeamPanel] Fetching members for project:', effectiveProjectId);
        try {
          const url = '/api/projects/' + effectiveProjectId + '/members';
          console.log('[TeamPanel] Fetching from URL:', url);
          
          const response = await fetch(url);
          console.log('[TeamPanel] Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('[TeamPanel] Backend members response (full):', JSON.stringify(data));
            
            if (Array.isArray(data) && data.length > 0) {
              const fetchedMembers = (data as PlatformMember[]).map((m: PlatformMember): Member => {
                const name = m.name || m.username || 'Usuario';
                const status: MemberStatus = m.status === 'active' ? 'online' : 'away';
                const memberId = m.id.toString();
                
                // Check if this is the current user
                const isCurrentUser = user && memberId === user.id;
                
                console.log('[TeamPanel] Processing member:', { name, memberId, userIdToCompare: user?.id, isCurrentUser });
                
                return {
                  id: memberId,
                  name: isCurrentUser ? name + ' (Tú)' : name,
                  role: m.role || 'Investigador',
                  initials: name.substring(0, 2).toUpperCase(),
                  status,
                };
              });

              console.log('[TeamPanel] Final processed members:', fetchedMembers);
              members = fetchedMembers;
            } else {
              console.warn('[TeamPanel] No members returned from backend. Data:', data);
            }
          } else {
            const errorText = await response.text();
            console.error('[TeamPanel] Error fetching members - Status:', response.status, response.statusText, 'Body:', errorText);
          }
        } catch (error) {
          console.error('[TeamPanel] Fetch error:', error);
        }
      } else {
        console.log('[TeamPanel] No projectId available. Cannot fetch members.');
      }

      setTeamMembers(members);
    };

    if (user) {
      fetchMembers();
    }
  }, [projectId, user]);
  

  return (
    <>
      {/* Cerrado — barra delgada con botón */}
      {!open && (
        <div className="flex-shrink-0 w-10 bg-surface border-l border-lab-border flex flex-col items-center pt-3">
          <button
            onClick={() => setOpen(true)}
            title="Abrir estado"
            className="p-2 rounded hover:bg-lab-bg text-muted hover:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Abierto — panel completo */}
      {open && (
        <aside className="flex-shrink-0 w-72 bg-surface border-l border-lab-border flex flex-col h-full">
          {/* Header */}
          <div className="h-11 bg-lab-bg border-b border-lab-border flex items-center justify-between px-4 shrink-0">
            <h2 className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
              {projectMode === 'solo' ? 'Estado' : 'Equipo y Estado'}
            </h2>
            <button
              onClick={() => setOpen(false)}
              title="Cerrar panel"
              className="p-1.5 rounded hover:bg-lab-bg text-muted hover:text-gray-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6"  y2="18" />
                <line x1="6"  y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Progreso del Módulo */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-3">
                {projectMode === 'solo' ? 'Mi Progreso' : 'Progreso Actual'}
              </h3>
              <div className={`rounded-lg border border-lab-border p-3 ${
                isDark ? 'bg-gradient-to-br from-[#132238] to-[#0f1c2f]' : 'bg-gradient-to-br from-[#f8fbff] to-[#f1f6fc]'
              }`}>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-gray-600">Nuevo Proyecto</span>
                  <span className="text-accent font-semibold">0%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-[10px] text-gray-500">0 bloques completados</p>
              </div>
            </div>

            {/* Miembros Conectados */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-3">
                {projectMode === 'solo' ? 'Conectado' : 'Conectados'}
              </h3>
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded bg-gray-100 border border-lab-border flex items-center justify-center text-xs font-semibold text-gray-600">
                        {member.initials}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${
                        isDark ? 'border-[#0f1724]' : 'border-white'
                      } ${member.status === 'online' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800 leading-tight">{member.name}</span>
                      <span className="text-[10px] text-muted font-mono leading-tight">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>
      )}
    </>
  );
}