import { useState } from 'react'

const aiTools = [
  {
    id: 'vision',
    name: 'Azure Vision',
    description: 'Análisis de imágenes y extracción de características visuales en tiempo real para experimentos y muestras.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
    )
  },
  {
    id: 'speech',
    name: 'Azure Speech',
    description: 'Reconocimiento y transcripción de voz para documentar notas de laboratorio sin usar las manos.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="22"></line>
      </svg>
    )
  },
  {
    id: 'document',
    name: 'Document Intelligence',
    description: 'Extracción automatizada de texto, estructura y pares clave-valor desde documentos y PDFs científicos.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    )
  },
  {
    id: 'openai',
    name: 'Azure OpenAI',
    description: 'Motor principal de razonamiento y orquestador cognitivo para síntesis de literatura y generación de hipótesis.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20"></path>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    )
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Agente veloz especializado en la transformación rápida de textos y resúmenes de información experimental.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    )
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Asistente de lógica profunda para verificación de pasos analíticos y depuración algorítmica y de datos.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h4l3-9 5 18 3-9h5"></path>
      </svg>
    )
  }
]

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
        <aside className="flex-shrink-0 w-[250px] bg-surface border-r border-lab-border flex flex-col h-full overflow-visible z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-lab-border shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Herramientas IA</span>
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

          {/* Contenido scrolleable vacío manteniéndose el menú abrible/cerrable */}
          <div className="flex-1 overflow-y-visible py-4">

          </div>
        </aside>
      )}
    </>
  )
}