import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useProject } from '../context/ProjectContext';

export default function LabWorkspace() {
  const { projectMode } = useProject();
  
  const initialCodeSolo = `// log: 2026-03-20 - Mi Proyecto Solo
// Analizando y limpiando los datos del experimento.

import { analyzeSpectrum } from './core/spectrometer';

export function processData(rawData) {
  // TODO: Implementar limpieza de datos
  
  
  return null;
}
`;

  const initialCodeTeam = `// log: 2026-03-20 - Alpha Team
// Necesitamos que esta función procese los datos del espectrómetro antes del mediodía.
// PD: No borres las importaciones principales.

import { analyzeSpectrum } from './core/spectrometer';

export function processData(rawData) {
  // TODO: Implementar limpieza de datos
  
  
  return null;
}
`;

  const [code, setCode] = useState(projectMode === 'solo' ? initialCodeSolo : initialCodeTeam);

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
      
      {/* Panel Izquierdo: Log de Tareas / Comentarios */}
      <div className="w-full md:w-1/3 bg-surface border border-lab-border rounded-lg flex flex-col overflow-hidden shadow-sm">
        <div className="h-10 bg-lab-bg border-b border-lab-border flex items-center px-4 justify-between">
          <h2 className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            {projectMode === 'solo' ? 'Mi Registro' : 'Log de Equipo'}
          </h2>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-sm font-sans bg-[#fbfbfb]">
          
          {projectMode === 'team' ? (
            <>
              {/* Mensaje 1 */}
              <div className="bg-white border border-lab-border p-3 rounded shadow-sm relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-accent text-xs">Dr. A. Gómez</span>
                  <span className="text-[10px] text-muted font-mono">08:42 AM</span>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  Las lecturas del sensor principal están llegando con ruido. Hay que crear un filtro pasa-bajos en <code className="bg-gray-100 px-1 py-0.5 rounded text-accent text-xs">processData</code>.
                </p>
              </div>

              {/* Mensaje 2 (Tarea Activa) */}
              <div className="bg-accent-light border border-accent p-3 rounded shadow-sm relative">
                <div className="absolute -left-1 top-4 w-2 h-8 bg-accent rounded-r"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-accent text-xs">Sistema Central</span>
                  <span className="text-[10px] text-accent font-mono">AHORA</span>
                </div>
                <div className="text-gray-800 leading-relaxed text-sm">
                  <strong>Prioridad Alta:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Limpiar nulos del arreglo <code className="bg-white px-1 py-0.5 rounded text-xs">rawData</code>.</li>
                    <li>Aplicar la función <code className="bg-white px-1 py-0.5 rounded text-xs">analyzeSpectrum</code>.</li>
                    <li>Retornar el objeto normalizado.</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Mensaje Solo */}
              <div className="bg-accent-light border border-accent p-3 rounded shadow-sm relative">
                <div className="absolute -left-1 top-4 w-2 h-8 bg-accent rounded-r"></div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-accent text-xs">Módulos de Sistema</span>
                  <span className="text-[10px] text-accent font-mono">AHORA</span>
                </div>
                <div className="text-gray-800 leading-relaxed text-sm">
                  <strong>Tus tareas activas:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Filtrar y analizar matriz de variables independientes <code className="bg-white px-1 py-0.5 rounded text-xs">rawData</code>.</li>
                    <li>Verificar la distribución de ruido.</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Input para nuevo log */}
          <div className="mt-auto pt-4">
            <textarea 
              rows={2}
              className="w-full px-3 py-2 border border-lab-border rounded focus:outline-none focus:border-accent text-xs resize-none"
              placeholder="Añadir nota al log del equipo..."
            />
            <div className="flex justify-end mt-2">
              <button className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-medium hover:bg-black transition-colors">
                Publicar
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Panel Derecho: Editor y Consola */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        
        {/* Editor de Código */}
        <div className="flex-1 bg-surface border border-lab-border rounded-lg flex flex-col overflow-hidden shadow-sm min-h-[400px]">
          <div className="h-10 bg-lab-bg border-b border-lab-border flex items-center justify-between px-4">
            <div className="flex gap-2 items-center">
              <span className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
                index.js
              </span>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-mono">
                javascript
              </span>
            </div>
            {/* Botones de acción del editor */}
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-lab-border hover:bg-gray-50 text-gray-700 rounded text-xs font-medium transition-colors">
                Restablecer
              </button>
              <button 
                className="px-3 py-1 bg-accent text-white rounded text-xs font-medium hover:bg-accent-dim transition-colors flex gap-1.5 items-center"
                onClick={() => console.log('Ejecutando código...')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Ejecutar
              </button>
            </div>
          </div>
          
          <div className="flex-1">
            <Editor
              height="100%"
              language="javascript"
              theme="vs-light" // Se reemplazará con un tema personalizado después
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'IBM Plex Mono, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                wordWrap: 'on'
              }}
            />
          </div>
        </div>

        {/* Consola / Terminal Simulada */}
        <div className="h-48 bg-[#1e1e1e] rounded-lg flex flex-col overflow-hidden shadow-sm shadow-black/20">
          <div className="h-8 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-black/40">
            <div className="flex gap-4 h-full">
              <button className="text-[11px] font-mono font-medium text-gray-300 uppercase tracking-widest border-b-2 border-accent transition-colors">
                Terminal
              </button>
              <button className="text-[11px] font-mono font-medium text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors">
                Tests
              </button>
              <button className="text-[11px] font-mono font-medium text-gray-500 hover:text-gray-300 uppercase tracking-widest transition-colors">
                Problemas
              </button>
            </div>
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-white transition-colors" title="Limpiar Terminal">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <div className="p-4 overflow-y-auto text-[13px] font-mono text-gray-300 flex-1 custom-scrollbar">
            <p className="text-blue-400 font-semibold mb-1">SapientLab OS v1.0.4</p>
            <p className="text-gray-500 mb-2">Conectando instancia remota... OK.</p>
            
            <p className="text-gray-400 mt-2">~/sapientlab/espectrometro-core $ <span className="text-gray-100">npm run analyze</span></p>
            
            <p className="text-gray-400 mt-1">&gt; Iniciando análisis de espectro...</p>
            <p className="text-gray-400">&gt; Cargando <span className="text-yellow-200">./core/spectrometer.js</span></p>
            
            <div className="mt-2 p-2 bg-red-900/30 border-l-2 border-red-500 text-red-200">
              <p className="font-semibold text-red-400">Error: Datos nulos encontrados en la muestra [índice: 4]</p>
              <p className="text-xs mt-1">at processData (index.js:8:15)</p>
              <p className="text-xs">at Object.&lt;anonymous&gt; (runner.js:22:3)</p>
            </div>

            <p className="mt-3 text-yellow-500">⚠ Falla en la pre-validación de los test (0/3 completados).</p>
            
            <div className="flex mt-3 items-center">
              <span className="text-green-500 mr-2">~/sapientlab/espectrometro-core $</span>
              <span className="animate-pulse w-2 h-4 bg-gray-400 block"></span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}