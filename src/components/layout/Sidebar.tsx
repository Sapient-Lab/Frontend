import { useState } from 'react'
import { FiX, FiMenu, FiCpu, FiUploadCloud, FiMic, FiMicOff, FiSend } from 'react-icons/fi'
import ProtocolScanner from '../../pages/ProtocolScanner'

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <>
      {/* Barra colapsada */}
      {!open && (
        <div className="flex-shrink-0 w-10 bg-[#0f1624]/80 backdrop-blur-sm border-r border-accent/20 flex flex-col items-center pt-3">
          <button
            onClick={() => setOpen(true)}
            title="Abrir Visor de Imágenes"
            className="p-2 rounded-lg hover:bg-accent/10 text-slate-400 hover:text-accent transition-all duration-300 group"
          >
            <FiMenu className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Sidebar completo - Visor de Imágenes */}
      {open && (
        <aside className="flex-shrink-0 w-[400px] lg:w-[450px] bg-[#0f1624]/80 backdrop-blur-sm border-r border-accent/20 flex flex-col h-full overflow-hidden z-20 shadow-xl">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-accent/20 shrink-0 bg-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-lg">
                <FiCpu className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Visión Mágica
                </span>
                <p className="text-[10px] font-mono text-accent tracking-wider">ANÁLISIS VISUAL POR IA</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              title="Cerrar visor"
              className="p-2 rounded-lg hover:bg-accent/10 text-slate-400 hover:text-accent transition-all duration-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            
            {/* Versión compacta del ProtocolScanner con textos más grandes */}
            <div className="space-y-5">
              
              {/* Descripción */}
              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Sube una imagen de un manual, tubo de ensayo, esquema de laboratorio o protocolo. 
                  La IA lo interpretará usando visión computacional para darte un resumen.
                </p>
              </div>

              {/* Zona de subida de imagen */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-accent uppercase tracking-wider block">
                  1. Adjuntar Evidencia Gráfica (Opcional)
                </label>
                <div className="border-2 border-dashed border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/10 transition-all duration-300">
                  <FiUploadCloud className="w-10 h-10 text-accent/60 mb-3" />
                  <span className="text-sm font-mono text-slate-300">Haz clic para subir una imagen del protocolo o equipo</span>
                  <span className="text-xs font-mono text-slate-500 mt-2">PNG, JPG, JPEG (Max 5MB)</span>
                </div>
              </div>

              {/* Contexto adicional */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                    2. Instrucciones / Contexto Adicional
                  </label>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-mono bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-300 flex items-center gap-2">
                    <FiMic className="w-3.5 h-3.5" />
                    Dictar
                  </button>
                </div>
                <textarea
                  placeholder="Pega texto del protocolo aquí, o presiona el botón de micrófono para dictar con tu voz..."
                  className="w-full h-32 p-3 text-sm font-mono bg-[#0a0f1c] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-slate-200 placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Botón analizar */}
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-white text-sm font-mono font-medium hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 flex items-center justify-center gap-2">
                <FiSend className="w-4 h-4" />
                Escanear ahora
              </button>

              {/* Resultado */}
              <div className="pt-3 border-t border-accent/20">
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                    <FiCpu className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="text-sm font-mono text-slate-400">Aquí verás el resumen visual de tu imagen o protocolo</p>
                  <p className="text-xs font-mono text-slate-500 mt-1">junto con alertas de riesgo y checklist operativo</p>
                </div>
              </div>
            </div>
          </div>

        </aside>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
    </>
  )
}