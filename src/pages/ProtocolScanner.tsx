import { useState } from 'react';
import { aiService } from '../services/aiService';

export default function ProtocolScanner() {
  const [protocolText, setProtocolText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!protocolText.trim()) {
      setError('Por favor, pega el protocolo del experimento.');
      return;
    }

    setIsLoading(true);
    setError('');
    setScanResult(null);

    try {
      const result = await aiService.interpretProtocol(protocolText);
      setScanResult(result);
    } catch (err: any) {
      setError(err.message || 'Error al escanear el protocolo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
            Escáner de Protocolos de Seguridad
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Interpreta protocolos experimentales con trazabilidad y foco en seguridad. El asistente sugiere precauciones y pasos de control, pero la decisión final siempre recae en el equipo científico.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-xl border border-[#d8e1ec] bg-white/80">
          <p className="text-xs text-[#4f6278] leading-relaxed">
            Límite de uso: evita ejecutar recomendaciones sensibles sin validación humana y políticas de bioseguridad del laboratorio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm flex flex-col stagger-in">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Instrucciones del Experimento</h2>
            <textarea
              className="w-full flex-1 min-h-[300px] p-4 text-sm font-sans bg-gray-50 border border-lab-border rounded-lg resize-none focus:outline-none focus:border-accent"
              placeholder="Ejemplo: Transferir 50 mL de HCl 1M, añadir NaOH 0.5M de forma controlada, registrar pH por minuto, detener si supera umbral térmico..."
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
            />
            {error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                {error}
              </p>
            )}
            <button
              onClick={handleScan}
              disabled={isLoading}
              className={`mt-4 w-full py-3 rounded text-sm font-medium transition-colors text-white ${
                isLoading ? 'bg-muted cursor-not-allowed' : 'bg-accent hover:bg-accent-dim'
              }`}
            >
              {isLoading ? 'Evaluando riesgos y controles...' : 'Escanear protocolo'}
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            {scanResult ? (
              <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm h-full overflow-y-auto animate-in fade-in stagger-in" style={{ animationDelay: '80ms' }}>
                
                {scanResult.structured ? (
                  <div className="space-y-6">
                    {/* Resumen */}
                    <div>
                      <h3 className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Resumen del Procedimiento
                      </h3>
                      <p className="text-sm text-gray-700">{scanResult.structured.summary}</p>
                    </div>

                    {/* Peligros */}
                    {scanResult.structured.hazards && scanResult.structured.hazards.length > 0 && (
                      <div className="p-4 bg-red-50/50 rounded-lg border border-red-100">
                        <h3 className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          Riesgos detectados
                        </h3>
                        <ul className="list-disc pl-4 text-sm text-red-800 space-y-1">
                          {scanResult.structured.hazards.map((hazard: string, idx: number) => (
                            <li key={idx}>{hazard}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Checklist */}
                    {scanResult.structured.checklist && scanResult.structured.checklist.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Checklist de bioseguridad
                        </h3>
                        <div className="space-y-3">
                          {scanResult.structured.checklist.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                              <input type="checkbox" className="mt-1 w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{item.action}</p>
                                {item.cautions && <p className="text-xs text-orange-600 mt-1">⚠️ {item.cautions}</p>}
                                {item.riskLevel && (
                                  <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                                    item.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                                    item.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    Riesgo: {item.riskLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-2">Respuesta del motor IA:</p>
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-xs border border-gray-100 font-mono">
                      {scanResult.rawModelResponse}
                    </pre>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-lab-border rounded-xl p-6 flex flex-col items-center justify-center h-full text-gray-400">
                <span className="text-4xl mb-4">🛡️</span>
                <p className="text-sm text-center">Aquí verás alertas de riesgo, controles sugeridos y una explicación base para cada recomendación.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
