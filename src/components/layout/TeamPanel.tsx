import { useState, useRef } from 'react';
import { FiAlertTriangle, FiFileText, FiSearch, FiTarget, FiUploadCloud, FiSidebar, FiX, FiBarChart2 } from 'react-icons/fi';
import { aiService } from '../../services/aiService';

export default function TeamPanel() {
  const [open, setOpen] = useState(false);

  // Estados de Análisis de Datos
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
      formData.append('file', file);

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

  return (
    <>
      {/* Cerrado — barra delgada con botón */}
      {!open && (
        <div className="flex-shrink-0 w-10 bg-surface border-l border-lab-border flex flex-col items-center pt-3">
          <button
            onClick={() => setOpen(true)}
            title="Abrir panel de análisis"
            className="p-2 rounded hover:bg-lab-bg text-muted hover:text-gray-700 transition-colors"
          >
            <FiSidebar className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Abierto — panel ampliado para Análisis de Datos */}
      {open && (
        <aside className="flex-shrink-0 w-80 lg:w-[400px] bg-surface border-l border-lab-border flex flex-col h-full z-20">
          {/* Header */}
          <div className="h-11 bg-lab-bg border-b border-lab-border flex items-center justify-between px-4 shrink-0">
            <h2 className="text-xs font-mono font-semibold text-accent uppercase tracking-wider">
              Análisis de Datos
            </h2>
            <button
              onClick={() => setOpen(false)}
              title="Cerrar panel"
              className="p-1.5 rounded hover:bg-lab-bg text-muted hover:text-gray-700 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Contexto breve */}
            <div className="p-3 bg-blue-50/50 rounded-lg text-xs text-blue-800 border border-blue-100">
              Evalúa resultados para detectar señales y anomalías. Valida siempre con revisión humana.
            </div>

            {/* Input Data */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 mb-2">Pegar contenido CSV:</label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="tiempo_s,temperatura_c,presion_atm&#10;0,22.5,1.01"
                className="w-full h-32 p-3 border border-lab-border rounded-lg bg-gray-50 font-mono text-[10px] focus:outline-none focus:border-accent resize-none"
              />
              
              <div className="mt-2 flex">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full px-3 py-2 rounded text-[11px] font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
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
                <div className="mt-3 p-2 bg-red-50 text-red-600 text-[10px] rounded border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`mt-3 w-full py-2.5 rounded text-xs font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                  isLoading ? 'bg-muted cursor-not-allowed' : 'bg-accent hover:bg-accent-dim'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Analizando...
                  </>
                ) : (
                  'Analizar resultados'
                )}
              </button>
            </div>

            {/* Análisis Results */}
            <div className="pt-2 border-t border-gray-100">
              {analysisResult ? (
                <div className="flex flex-col gap-4 animate-in fade-in">
                  {/* Resumen Numerico */}
                  {analysisResult.csvSummary && (
                    <div className="pb-3 border-b border-gray-100">
                      <h3 className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Estadísticas
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 bg-gray-50 rounded border border-gray-100">
                          <span className="text-gray-500 block">Total Filas</span>
                          <span className="text-sm font-semibold text-gray-800">{analysisResult.csvSummary.rowCount}</span>
                        </div>
                        {analysisResult.csvSummary.numericColumns?.slice(0, 1).map((col: any) => (
                           <div key={col.name} className="p-2 bg-gray-50 rounded border border-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">
                             <span className="text-gray-500 block" title={`Promedio (${col.name})`}>Prom. ({col.name})</span>
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
                        <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                          <FiFileText className="w-3.5 h-3.5 text-accent" /> Resumen Narrativo
                        </h3>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {analysisResult.structured.narrativeSummary || "Resumen no disponible."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                          <FiTarget className="w-3.5 h-3.5 text-green-600" /> Hallazgos Notables
                        </h3>
                        <ul className="list-disc pl-4 text-[11px] text-gray-600 space-y-1">
                          {(analysisResult.structured.notableFindings || []).map((find: string, i: number) => (
                            <li key={i}>{find}</li>
                          ))}
                        </ul>
                      </div>

                      {analysisResult.structured.qualityFlags && analysisResult.structured.qualityFlags.length > 0 && (
                        <div className="p-3 bg-orange-50/50 rounded border border-orange-100">
                          <h3 className="text-xs font-bold text-orange-800 mb-1 flex items-center gap-1.5">
                            <FiAlertTriangle className="w-3.5 h-3.5 text-orange-500" /> Alertas
                          </h3>
                          <ul className="list-disc pl-4 text-[10px] text-orange-700 space-y-0.5">
                            {analysisResult.structured.qualityFlags.map((flag: string, i: number) => (
                              <li key={i}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <h3 className="text-xs font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                          <FiSearch className="w-3.5 h-3.5 text-blue-500" /> Próximos Pasos
                        </h3>
                        <ul className="list-disc pl-4 text-[11px] text-gray-600 space-y-1">
                          {(analysisResult.structured.recommendedChecks || []).map((step: string, i: number) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-600">
                      <p className="font-semibold mb-1">Respuesta cruda:</p>
                      <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded text-[9px] font-mono border border-gray-100 text-gray-700 break-words max-h-40 overflow-y-auto">
                        {analysisResult.rawModelResponse || JSON.stringify(analysisResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <FiBarChart2 className="w-8 h-8 mb-2 mx-auto text-gray-300" />
                  <p className="text-[10px]">Aún no hay resultados para mostrar.</p>
                </div>
              )}
            </div>

          </div>
        </aside>
      )}
    </>
  );
}