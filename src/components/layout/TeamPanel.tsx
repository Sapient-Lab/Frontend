import { useState } from 'react';
import { useProject } from '../../context/ProjectContext';

export default function TeamPanel() {
  const { projectMode } = useProject();
  const [open, setOpen] = useState(true);

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

            {/* Espacio en blanco por requerimiento */}

          </div>
        </aside>
      )}
    </>
  );
}