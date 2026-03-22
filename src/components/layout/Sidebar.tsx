import { useState } from 'react'
import type { SidebarModule } from '../../types/navigation'

const modules: SidebarModule[] = [
  { id: '1', label: 'Contexto del experimento', status: 'done'   },
  { id: '2', label: 'Ingesta de protocolo',     status: 'done'   },
  { id: '3', label: 'Evaluación de riesgo',     status: 'active' },
  { id: '4', label: 'Análisis de resultados',   status: 'locked' },
  { id: '5', label: 'Siguientes pasos',         status: 'locked' },
  { id: '6', label: 'Control de calidad',       status: 'locked' },
  { id: '7', label: 'Trazabilidad',             status: 'locked' },
]

const resources = ['Protocolos de referencia', 'Matriz de bioseguridad', 'Guía de cumplimiento']

const statusTag: Record<SidebarModule['status'], { label: string; className: string }> = {
  done:   { label: 'done',   className: 'bg-green-50 text-green-700' },
  active: { label: 'activo', className: 'bg-accent-light text-accent-dim' },
  locked: { label: 'pronto', className: 'bg-lab-bg text-muted border border-lab-border' },
}

const dotColor: Record<SidebarModule['status'], string> = {
  done:   'bg-green-600',
  active: 'bg-accent',
  locked: 'bg-lab-border',
}

const itemBase = 'flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] cursor-pointer transition-all border-l-2'

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Barra colapsada — solo visible cuando está cerrado */}
      {!open && (
        <div className="flex-shrink-0 w-10 bg-surface border-r border-lab-border flex flex-col items-center pt-3">
          <button
            onClick={() => setOpen(true)}
            title="Abrir menú"
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

      {/* Sidebar completo */}
      {open && (
        <aside className="flex-shrink-0 w-[250px] bg-surface border-r border-lab-border flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-lab-border shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Menú lateral</span>
            <button
              onClick={() => setOpen(false)}
              title="Cerrar menú"
              className="p-1.5 rounded hover:bg-lab-bg text-muted hover:text-gray-700 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6"  y2="18" />
                <line x1="6"  y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto py-4">

            {/* Módulos */}
            <div className="mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-5 pb-2">
                Módulos
              </p>
              {modules.map((mod) => {
                const isActive = mod.status === 'active'
                const tag = statusTag[mod.status]
                return (
                  <div
                    key={mod.id}
                    className={`${itemBase} ${
                      isActive
                        ? 'bg-accent-light text-accent border-accent font-medium'
                        : 'text-gray-500 border-transparent hover:bg-lab-bg hover:text-gray-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[mod.status]}`} />
                    <span className="flex-1">{mod.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${tag.className}`}>
                      {tag.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Recursos */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-5 pb-2">
                Recursos
              </p>
              {resources.map((r) => (
                <div key={r} className={`${itemBase} text-gray-500 border-transparent hover:bg-lab-bg hover:text-gray-800`}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-lab-border" />
                  {r}
                </div>
              ))}
            </div>

          </div>
        </aside>
      )}
    </>
  )
}