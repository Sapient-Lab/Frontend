import { useState, useRef } from 'react';
import { FiAlertTriangle, FiFileText, FiSearch, FiTarget, FiUploadCloud, FiSidebar, FiX, FiBarChart2, FiCpu } from 'react-icons/fi';
import { aiService } from '../../services/aiService';
import TaskRecommendation from '../TaskRecommendation';
import type { TaskRecommendationItem } from '../TaskRecommendation';

// Helper function to ensure a value is an array  
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(/[,\n•-]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
  }
  return [];
};

export default function TeamPanel() {
  const [open, setOpen] = useState(false);

  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!csvData.trim()) {
      setError('Por favor ingresa datos en formato CSV.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const result = await aiService.analyzeResults(csvData, 'csv');
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Hubo un error al analizar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/ai/document/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al procesar documento');
      
      const result = await response.json();
      
      if (result.extractedText) {
        setCsvData(result.extractedText);
      }
      
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Error al procesar el PDF/Excel.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const generateTaskRecommendations = (result: any): TaskRecommendationItem[] => {
    const recommendations: TaskRecommendationItem[] = [];

    if (!result?.structured) return recommendations;

    const notableFindings = ensureArray(result.structured.notableFindings);
    if (notableFindings.length > 0) {
      recommendations.push({
        title: 'Investigar Hallazgos Notables',
        description: `Se encontraron ${notableFindings.length} hallazgo(s) importante(s) en los datos. Revisa y documenta cada uno.`,
        aiAssigner: 'Análisis de Datos',
      });
    }

    const qualityFlags = ensureArray(result.structured.qualityFlags);
    if (qualityFlags.length > 0) {
      recommendations.push({
        title: 'Verificar Alertas de Calidad',
        description: `Hay ${qualityFlags.length} alerta(s) de calidad de datos. Valida y corrige los problemas identificados.`,
        aiAssigner: 'Análisis de Datos',
      });
    }

    const recommendedChecks = ensureArray(result.structured.recommendedChecks);
    if (recommendedChecks.length > 0) {
      recommendations.push({
        title: 'Ejecutar Pasos Recomendados',
        description: `El análisis sugiere ${recommendedChecks.length} paso(s) de validación adicional. Completa la revisión.`,
        aiAssigner: 'Análisis de Datos',
      });
    }

    return recommendations;
  };

  return (
    <>
      {/* Cerrado — barra delgada con botón */}
      {!open && (
        <div className="flex-shrink-0 w-10 bg-[#0f1624]/80 backdrop-blur-sm border-l border-accent/20 flex flex-col items-center pt-3">
          <button
            onClick={() => setOpen(true)}
            title="Abrir panel de análisis"
            className="p-2 rounded-lg hover:bg-accent/10 text-slate-400 hover:text-accent transition-all duration-300 group"
          >
            <FiSidebar className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}

      {/* Abierto — panel ampliado para Análisis de Datos */}
      {open && (
        <aside className="flex-shrink-0 w-80 lg:w-[400px] bg-[#0f1624]/80 backdrop-blur-sm border-l border-accent/20 flex flex-col h-full z-20 shadow-xl">
          
          {/* Header */}
          <div className="h-11 bg-accent/5 border-b border-accent/20 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2">
              <FiCpu className="w-3.5 h-3.5 text-accent" />
              <h2 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
                Análisis de Datos
              </h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              title="Cerrar panel"
              className="p-1.5 rounded-lg hover:bg-accent/10 text-slate-400 hover:text-accent transition-all duration-300"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            
            {/* Contexto breve */}
            <div className="p-3 bg-accent/5 rounded-xl border border-accent/20 text-xs text-slate-400 font-mono leading-relaxed">
              <div className="flex items-start gap-2">
                <FiBarChart2 className="w-3 h-3 text-accent mt-0.5" />
                <span>Evalúa resultados para detectar señales y anomalías. Valida siempre con revisión humana.</span>
              </div>
            </div>

            {/* Input Data */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                <FiFileText className="w-3 h-3" />
                Pegar contenido CSV:
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="tiempo_s,temperatura_c,presion_atm&#10;0,22.5,1.01"
                className="w-full h-32 p-3 border border-accent/20 rounded-xl bg-[#0a0f1c] font-mono text-[10px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 resize-none transition-all"
              />
              
              <div className="mt-2 flex">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded-xl text-[10px] font-mono font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <FiUploadCloud className="w-3.5 h-3.5" />
                  Importar PDF/Excel
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.xlsx,.xls,.csv"
                onChange={handleUploadDocument}
                className="hidden"
              />
              
              {error && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-[10px] font-mono">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`mt-3 w-full py-2.5 rounded-xl text-[11px] font-mono font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading 
                    ? 'bg-slate-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-accent to-purple-600 hover:shadow-lg hover:shadow-accent/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Analizando...
                  </>
                ) : (
                  <>
                    <FiSearch className="w-3.5 h-3.5" />
                    Analizar resultados
                  </>
                )}
              </button>
            </div>

            {/* Análisis Results */}
            <div className="pt-2 border-t border-accent/20">
              {analysisResult ? (
                <div className="flex flex-col gap-4 animate-in fade-in">
                  {/* Resumen Numerico */}
                  {analysisResult.csvSummary && (
                    <div className="pb-3 border-b border-accent/20">
                      <h3 className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-2">
                        Estadísticas
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 bg-accent/5 rounded-xl border border-accent/20">
                          <span className="text-slate-500 block text-[9px] font-mono">Total Filas</span>
                          <span className="text-sm font-semibold text-slate-200">{analysisResult.csvSummary.rowCount}</span>
                        </div>
                        {analysisResult.csvSummary.numericColumns?.slice(0, 1).map((col: any) => (
                           <div key={col.name} className="p-2 bg-accent/5 rounded-xl border border-accent/20 overflow-hidden text-ellipsis whitespace-nowrap">
                             <span className="text-slate-500 block text-[9px] font-mono" title={`Promedio (${col.name})`}>Prom. ({col.name})</span>
                             <span className="text-sm font-semibold text-accent">{col.mean?.toFixed(2)}</span>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estructurado */}
                  {analysisResult.structured ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FiFileText className="w-3 h-3" /> Resumen Narrativo
                        </h3>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                          {analysisResult.structured.narrativeSummary || "Resumen no disponible."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FiTarget className="w-3 h-3" /> Hallazgos Notables
                        </h3>
                        <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1 font-mono">
                          {ensureArray(analysisResult.structured.notableFindings).map((find: string, i: number) => (
                            <li key={i}>{find}</li>
                          ))}
                        </ul>
                      </div>

                      {ensureArray(analysisResult.structured.qualityFlags).length > 0 && (
                        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30">
                          <h3 className="text-[10px] font-mono font-bold text-orange-400 mb-2 flex items-center gap-1.5">
                            <FiAlertTriangle className="w-3 h-3" /> Alertas
                          </h3>
                          <ul className="list-disc pl-4 text-[10px] text-orange-300 space-y-0.5 font-mono">
                            {ensureArray(analysisResult.structured.qualityFlags).map((flag: string, i: number) => (
                              <li key={i}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h3 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FiSearch className="w-3 h-3" /> Próximos Pasos
                        </h3>
                        <ul className="list-disc pl-4 text-[11px] text-slate-300 space-y-1 font-mono">
                          {ensureArray(analysisResult.structured.recommendedChecks).map((step: string, i: number) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Task Recommendations */}
                      {generateTaskRecommendations(analysisResult).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-accent/20">
                          <h3 className="text-[9px] font-mono font-bold text-accent uppercase tracking-wider mb-2">
                            Tareas Sugeridas
                          </h3>
                          <TaskRecommendation recommendations={generateTaskRecommendations(analysisResult)} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400">
                      <p className="font-mono font-semibold mb-1">Respuesta cruda:</p>
                      <pre className="whitespace-pre-wrap bg-accent/5 p-2 rounded-lg text-[9px] font-mono border border-accent/20 text-slate-300 break-words max-h-40 overflow-y-auto custom-scrollbar">
                        {analysisResult.rawModelResponse || JSON.stringify(analysisResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                    <FiBarChart2 className="w-6 h-6 text-slate-500" />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">Aún no hay resultados para mostrar.</p>
                </div>
              )}
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}