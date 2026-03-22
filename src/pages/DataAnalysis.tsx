import { useState } from 'react';
import { FiAlertTriangle, FiFileText, FiSearch, FiTarget } from 'react-icons/fi';
import { aiService } from '../services/aiService';

export default function DataAnalysis() {
  const [csvData, setCsvData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!csvData.trim()) {
      setError('Por favor ingresa datos en formato CSV.');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      // Usamos el servicio de IA conectado al backend (Azure AI)
      const result = await aiService.analyzeResults(csvData, 'csv');
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Hubo un error al analizar los datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
            Análisis de Datos
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Evalúa resultados desde CSV para detectar señales, anomalías y controles recomendados. El objetivo es apoyar la interpretación con explicaciones claras y auditables.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-xl border border-[#d8e1ec] bg-white/80">
          <p className="text-xs text-[#4f6278] leading-relaxed">
            Recomendación responsable: valida siempre las conclusiones con contexto experimental, instrumentos y revisión humana antes de actuar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna Izquierda: Input */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm flex flex-col h-full stagger-in">
              <label className="text-sm font-semibold text-gray-700 mb-2">Pegar contenido CSV:</label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                placeholder="tiempo_s,temperatura_c,presion_atm&#10;0,22.5,1.01&#10;1,23.1,1.02&#10;2,23.5,1.02"
                className="flex-1 w-full p-4 border border-lab-border rounded-lg bg-gray-50 font-mono text-xs focus:outline-none focus:border-accent resize-none min-h-[300px]"
              />
              
              {/* Opcional: Para futuro drag & drop se puede incluir aquí */}
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className={`mt-4 px-6 py-3 rounded text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 ${
                  isLoading ? 'bg-muted cursor-not-allowed' : 'bg-accent hover:bg-accent-dim'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                    Analizando evidencia...
                  </>
                ) : (
                  'Analizar resultados'
                )}
              </button>
            </div>
          </div>

          {/* Columna Derecha: Output */}
          <div className="flex flex-col gap-4">
            {analysisResult ? (
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm flex flex-col h-full overflow-y-auto animate-in fade-in stagger-in" style={{ animationDelay: '80ms' }}>
                
                {/* Resumen Numerico (Generado por papa parse en NestJS) */}
                {analysisResult.csvSummary && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <h3 className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">
                      Estadísticas de la Muestra
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block mb-1">Total Filas</span>
                        <span className="text-lg font-semibold text-gray-800">{analysisResult.csvSummary.rowCount}</span>
                      </div>
                      {analysisResult.csvSummary.numericColumns?.slice(0, 1).map((col: any) => (
                         <div key={col.name} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                           <span className="text-gray-500 block mb-1">Promedio ({col.name})</span>
                           <span className="text-lg font-semibold text-accent">{col.mean?.toFixed(2)}</span>
                         </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Respuesta del LLM Structurado */}
                {analysisResult.structured ? (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FiFileText className="w-4 h-4 text-accent" /> Resumen Narrativo
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {analysisResult.structured.narrativeSummary || "Resumen no disponible."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FiTarget className="w-4 h-4 text-green-600" /> Hallazgos Notables
                      </h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {(analysisResult.structured.notableFindings || []).map((find: string, i: number) => (
                          <li key={i}>{find}</li>
                        ))}
                      </ul>
                    </div>

                    {analysisResult.structured.qualityFlags && analysisResult.structured.qualityFlags.length > 0 && (
                      <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
                        <h3 className="text-sm font-bold text-orange-800 mb-2 flex items-center gap-2">
                          <FiAlertTriangle className="w-4 h-4 text-orange-500" /> Alertas de Calidad
                        </h3>
                        <ul className="list-disc pl-5 text-sm text-orange-700 space-y-1">
                          {analysisResult.structured.qualityFlags.map((flag: string, i: number) => (
                            <li key={i}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                        <FiSearch className="w-4 h-4 text-blue-500" /> Próximos Pasos Recomendados
                      </h3>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {(analysisResult.structured.recommendedChecks || []).map((step: string, i: number) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-2">Respuesta en bruto del asistente:</p>
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-xs font-mono border border-gray-100 text-gray-700 break-words">
                      {analysisResult.rawModelResponse || JSON.stringify(analysisResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border text-center border-lab-border border-dashed rounded-xl p-6 flex flex-col items-center justify-center h-full text-gray-400">
                <svg className="w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">Carga datos experimentales para obtener resumen, alertas de calidad y próximos chequeos recomendados.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
