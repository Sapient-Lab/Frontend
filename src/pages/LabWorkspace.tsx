import { useState, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { FiAlertTriangle, FiZap } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';
import { useTheme } from '../context/ThemeContext';
import ChatAgent from '../components/laboratory/ChatAgent';
import { aiService } from '../services/aiService';

export default function LabWorkspace() {
  const { projectMode } = useProject();
  const { isDark } = useTheme();
  const providerRef = useRef<any>(null);
  const editorRef = useRef<any>(null); // Ref para el editor

  
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
  
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<any>(null);

  const handleInsertCode = (newCode: string) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Limpiar todo el contenido actual
    const fullRange = model.getFullModelRange();
    editor.executeEdits('ai-agent', [{ range: fullRange, text: '' }]);
    setCode('');

    // Efecto Copilot: escribir carácter a carácter
    let i = 0;
    let accumulated = '';
    const interval = setInterval(() => {
      if (i >= newCode.length) {
        clearInterval(interval);
        return;
      }
      // Añadir de a 3 caracteres por tick para que sea fluido pero rápido
      const chunk = newCode.slice(i, i + 3);
      accumulated += chunk;
      i += 3;
      setCode(accumulated);
      // Mover cursor al final
      const lastLineCount = model.getLineCount();
      const lastCol = model.getLineMaxColumn(lastLineCount);
      editor.setPosition({ lineNumber: lastLineCount, column: lastCol });
    }, 16); // ~60fps
  };
  const handleExplainCode = async () => {
    if (!editorRef.current) return;
    
    // Obtener texto seleccionado o todo el código si no hay selección
    const selection = editorRef.current.getSelection();
    const model = editorRef.current.getModel();
    let targetCode = model.getValueInRange(selection);
    
    if (!targetCode.trim()) {
      targetCode = model.getValue(); // Fallback a todo el código
    }

    setIsExplaining(true);
    setExplanationResult(null);
    try {
      const result = await aiService.explainCode(targetCode, "Explica este código y sugiere mejoras", "index.js");
      setExplanationResult(result);
    } catch (err: any) {
      console.error(err);
      alert("Error al explicar código: " + err.message);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Guardamos la instancia del editor
    editorRef.current = editor;

    // Evitar registrar múltiples veces en React Strict Mode
    if (providerRef.current) {
      providerRef.current.dispose();
    }

    providerRef.current = monaco.languages.registerInlineCompletionsProvider('javascript', {
      provideInlineCompletions: async (model: any, position: any) => {
        // Obtener prefijo (texto antes del cursor)
        const prefix = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        
        // Obtener sufijo (texto después del cursor)
        const suffix = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: model.getLineCount(),
          endColumn: model.getLineMaxColumn(model.getLineCount())
        });

        try {
          // Llamada al endpoint del backend enviando prefijo y sufijo
          const response = await aiService.getCopilotCompletion(
            'Completar el código actual', 
            prefix, 
            suffix
          );

          // Ajustar esto según la respuesta real del backend
          // Por defecto la API de mistral/deepseek podría devolver { suggestions: [{ text: "..." }] } o algo similar
          let suggestionText = '';
          if (response.suggestions && response.suggestions.length > 0) {
            suggestionText = response.suggestions[0].text;
          } else if (typeof response === 'string') {
            suggestionText = response; // Si devuelve solo texto
          } else if (response.completion) {
            suggestionText = response.completion;
          } else if (response.choices && response.choices.length > 0) {
            suggestionText = response.choices[0].text || response.choices[0].message?.content || '';
          }

          if (!suggestionText) {
             return { items: [] };
          }

          return {
            items: [
              {
                insertText: suggestionText,
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
              }
            ]
          };
        } catch (error) {
          console.error("Error al obtener completado IA", error);
          return { items: [] };
        }
      },
      freeInlineCompletions: () => {}
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-4 relative">
      
      {/* Modal de Explicación */}
      {explanationResult && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80%] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiZap className="w-5 h-5 text-yellow-500" /> Análisis de Código
              </h3>
              <button 
                onClick={() => setExplanationResult(null)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto space-y-4">
              {explanationResult.structured ? (
                <>
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-1">Resumen:</h4>
                    <p className="text-sm text-gray-600">{explanationResult.structured.summary}</p>
                  </div>
                  {explanationResult.structured.risks?.length > 0 && (
                    <div className="mb-4 p-3 bg-red-50/50 rounded-lg border border-red-100">
                      <h4 className="text-sm font-bold text-red-800 mb-1 flex items-center gap-1">
                        <FiAlertTriangle className="w-4 h-4" /> Riesgos detectados:
                      </h4>
                      <ul className="list-disc pl-4 text-xs text-red-700 space-y-1">
                        {explanationResult.structured.risks.map((r: string, i: number) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}
                  {explanationResult.structured.suggestedImprovements?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-blue-700 mb-1 flex items-center gap-1">
                        <FiZap className="w-4 h-4" /> Sugerencias:
                      </h4>
                      <ul className="list-disc pl-4 text-xs text-gray-600 space-y-1">
                        {explanationResult.structured.suggestedImprovements.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-2">Respuesta del Agente:</p>
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-xs font-mono border border-gray-100">
                    {explanationResult.rawModelResponse || JSON.stringify(explanationResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setExplanationResult(null)}
                className="px-4 py-2 bg-accent text-white rounded text-sm font-medium hover:bg-accent-dim"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel Izquierdo: Log de Tareas / Comentarios */}
      <div className="w-full md:w-1/3 bg-surface border border-lab-border rounded-lg flex flex-col overflow-hidden shadow-sm min-h-0">
        <div className="h-10 shrink-0 bg-lab-bg border-b border-lab-border flex items-center px-4 justify-between">
          <h2 className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
            {projectMode === 'solo' ? 'Mi Registro' : 'Log de Equipo'}
          </h2>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
        
        {/* Cambiamos el Log estático por el Chat del Agente */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatAgent onInsertCode={handleInsertCode} editorContext={code} />
        </div>
      </div>

      {/* Panel Derecho: Editor y Consola */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        
        {/* Editor de Código */}
        <div className="flex-1 bg-surface border border-lab-border rounded-lg flex flex-col overflow-hidden shadow-sm min-h-[300px]">
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
              <button 
                onClick={handleExplainCode}
                disabled={isExplaining}
                className={`px-3 py-1 border border-lab-border text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                  isExplaining
                    ? 'bg-muted text-white cursor-not-allowed'
                    : isDark
                      ? 'bg-[#1d2b3f] text-blue-100 hover:bg-[#2a3d58]'
                      : 'bg-[#e2e8f0] text-gray-700 hover:bg-[#cbd5e1]'
                }`}
                title="Selecciona texto para explicar solo esa parte"
              >
                {isExplaining ? 'Pensando...' : (
                  <>
                    <FiZap className="w-3.5 h-3.5" /> Explicar
                  </>
                )}
              </button>

              <button
                className={`px-3 py-1 border border-lab-border rounded text-xs font-medium transition-colors ${
                  isDark ? 'bg-[#0f1724] text-blue-100 hover:bg-[#162338]' : 'bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
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
              theme={isDark ? 'vs-dark' : 'vs-light'}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'IBM Plex Mono, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbersMinChars: 3,
                wordWrap: 'on',
                inlineSuggest: { enabled: true } // Habilitar sugerencias inline
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