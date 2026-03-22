import { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';

export default function TeamPanel() {
  const { projectMode } = useProject();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(true);

  const teamMembers = [
    { id: 1, name: 'Tú', initials: 'FC', role: 'Desarrollador', status: 'online' },
    ...((projectMode === 'team') ? [
      { id: 2, name: 'Dr. A. Gómez', initials: 'AG', role: 'Investigador Principal', status: 'online' },
      { id: 3, name: 'Elena R.', initials: 'ER', role: 'Especialista Datos', status: 'away' },
      { id: 4, name: 'Sistema Central', initials: 'Sys', role: 'Bot Automático', status: 'online' },
    ] : [
      { id: 4, name: 'Sistema Central', initials: 'Sys', role: 'Asistente IA', status: 'online' }
    ])
  ];

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
                  <span className="text-gray-600">Fase de validación</span>
                  <span className="text-accent font-semibold">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div className="bg-accent h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-[10px] text-gray-500">2 de 3 bloques experimentales completados</p>
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

            {/* Estado del Sistema */}
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-3">Estado del Sistema</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-600">Conexión a base de datos estable</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-600">Registro de laboratorio sincronizado</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <svg className="w-3.5 h-3.5 text-accent animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                  <span className="text-gray-600">Evaluando recomendaciones seguras...</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 border-t border-lab-border bg-lab-bg shrink-0">
            <button className={`w-full py-2 border border-lab-border text-accent font-mono text-sm font-semibold rounded-lg transition-colors shadow-sm ${
              isDark ? 'bg-[#0f1724] hover:bg-[#162338]' : 'bg-white hover:bg-gray-50'
            }`}>
              Validar bitácora
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

  const teamMembers = [
    { id: 1, name: 'Tú', initials: 'FC', role: 'Desarrollador', status: 'online' },
    ...((projectMode === 'team') ? [
      { id: 2, name: 'Dr. A. Gómez', initials: 'AG', role: 'Investigador Principal', status: 'online' },
      { id: 3, name: 'Elena R.', initials: 'ER', role: 'Especialista Datos', status: 'away' },
      { id: 4, name: 'Sistema Central', initials: 'Sys', role: 'Bot Automático', status: 'online' },
    ] : [
      { id: 4, name: 'Sistema Central', initials: 'Sys', role: 'Asistente IA', status: 'online' }
    ])
  ];

  return (
    <aside className="w-72 bg-surface border-l border-lab-border flex flex-col h-full">
      <div className="h-11 bg-lab-bg border-b border-lab-border flex items-center px-4">
        <h2 className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
          {projectMode === 'solo' ? 'Estado' : 'Equipo y Estado'}
        </h2>
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
              <span className="text-gray-600">Fase de validación</span>
              <span className="text-accent font-semibold">65%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div className="bg-accent h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-[10px] text-gray-500">2 de 3 bloques experimentales completados</p>
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
                  <span className="text-sm font-medium text-gray-800 leading-tight">
                    {member.name}
                  </span>
                  <span className="text-[10px] text-muted font-mono leading-tight">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entregas y validaciones */}
        <div>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted mb-3">Estado del Sistema</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-gray-600">Conexión a base de datos estable</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span className="text-gray-600">Registro de laboratorio sincronizado</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <svg className="w-3.5 h-3.5 text-accent animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span className="text-gray-600">Evaluando recomendaciones seguras...</span>
            </div>
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-lab-border bg-lab-bg">
        <button className={`w-full py-2 border border-lab-border text-accent font-mono text-sm font-semibold rounded-lg transition-colors shadow-sm ${
          isDark ? 'bg-[#0f1724] hover:bg-[#162338]' : 'bg-white hover:bg-gray-50'
        }`}>
          Validar bitácora
        </button>
      </div>

    </aside>
  );
}