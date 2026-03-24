import { useState } from 'react'
import ProtocolScanner from '../../pages/ProtocolScanner'

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
        <aside className="flex-shrink-0 w-[400px] bg-surface border-r border-lab-border flex flex-col h-full overflow-visible z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-lab-border shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Visor de Imágenes</span>
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

          {/* Contenido scrolleable - Visor de Imágenes (Escaner de Protocolos) */}
          <div className="flex-1 overflow-y-auto w-full">
            <ProtocolScanner />
          </div>
        </aside>
      )}
    </>
  )
}