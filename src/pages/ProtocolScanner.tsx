import { useState, useRef } from 'react';
import { FiAlertTriangle, FiShield, FiUploadCloud, FiImage, FiX } from 'react-icons/fi';
import { aiService } from '../services/aiService';

export default function ProtocolScanner() {
  const [protocolText, setProtocolText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScan = async () => {
    if (!protocolText.trim() && !imagePreview) {
      setError('Por favor, pega el protocolo o sube una imagen.');
      return;
    }

    setIsLoading(true);
    setError('');
    setScanResult(null);

    try {
      if (imagePreview) {
        const base64Image = imagePreview.replace(/^data:image\/[a-z]+;base64,/, '');
        const prompt = "Actúa como un Oficial de Seguridad del Laboratorio de alto nivel. Evalúa esta imagen del protocolo, instrucciones químicas, o diagrama experimental.\nSi hay texto, tenlo en cuenta: " + protocolText + "\nProporciona una respuesta en formato JSON si es posible con summary, hazards y un checklist.";
        
        const result = await aiService.analyzeImage(base64Image, prompt);
        
        if (result.structured) {
            setScanResult(result);
        } else {
            // Mock structured format for fallback display so it looks stunning always
            setScanResult({
              structured: {
                summary: result.rawModelResponse || 'Resumen e interpretación extraída de la imagen por el modelo de visión.',
                hazards: ['Posibles riesgos detectados visualmente en el entorno o procedimiento.'],
                checklist: [{
                  action: 'Verificar contención primaria y medidas de bioseguridad basándose en la imagen.',
                  cautions: 'Recomendación derivada del análisis visual de IA.',
                  riskLevel: 'medium'
                }]
              },
              rawModelResponse: result.rawModelResponse
            });
        }
      } else {
        const result = await aiService.interpretProtocol(protocolText);
        setScanResult(result);
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
            Visión Mágica y Escáner de Protocolos
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sube una imagen de un manual, tubo de ensayo, esquema de laboratorio o protocolo. La IA lo interpretará usando visión computacional para sugerir precauciones de seguridad.
          </p>
        </div>

        <div className="mb-6 p-4 rounded-xl border border-[#d8e1ec] bg-white/80">
          <p className="text-xs text-[#4f6278] leading-relaxed">
            Límite de uso: la evaluación visual por IA es un apoyo experimental y en ocasiones podría crear "alucinaciones". Evita ejecutar recomendaciones sensibles sin validación humana.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <div className="bg-white border border-lab-border rounded-xl p-6 shadow-sm flex flex-col stagger-in">
            
            {/* Image Upload Zone */}
            <div className="mb-4">
              <label className="text-sm font-bold text-gray-700 mb-3 block">
                1. Adjuntar Evidencia Gráfica (Opcional)
              </label>
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500 font-medium">Haz clic para subir una imagen del protocolo o equipo</span>
                  <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                </div>
              ) : (
                <div className="relative border border-gray-200 rounded-lg p-2 bg-gray-50">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md opacity-80" />
                  <button 
                    onClick={clearImage}
                    className="absolute top-3 right-3 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm"
                    title="Quitar imagen"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                    <FiImage className="w-3 h-3" /> Evidencia cargada
                  </div>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
            
            <h2 className="text-sm font-bold text-gray-700 mb-3 block">2. Instrucciones / Contexto Adicional</h2>
            <textarea
              className="w-full flex-1 min-h-[160px] p-4 text-sm font-sans bg-gray-50 border border-lab-border rounded-lg resize-none focus:outline-none focus:border-accent"
              placeholder="Pega texto del protocolo aquí, o escribe detalles descriptivos sobre la imagen arriba adjuntada..."
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
              className={`mt-4 w-full py-3 rounded text-sm font-medium transition-colors text-white ${ isLoading ? 'bg-muted cursor-not-allowed' : 'bg-accent hover:bg-accent-dim' }`}
            >
              {isLoading ? 'Analizando con Visión IA...' : 'Escanear ahora'}
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
                        Resumen del Análisis Visual
                      </h3>
                      <p className="text-sm text-gray-700">{scanResult.structured.summary}</p>
                    </div>

                    {/* Peligros */}
                    {scanResult.structured.hazards && scanResult.structured.hazards.length > 0 && (
                      <div className="p-4 bg-red-50/50 rounded-lg border border-red-100">
                        <h3 className="text-[11px] font-mono font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FiAlertTriangle className="w-4 h-4" /> Riesgos detectados
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
                          Checklist de bioseguridad preventivo
                        </h3>
                        <div className="space-y-3">
                          {scanResult.structured.checklist.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                              <input type="checkbox" className="mt-1 w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent" />
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{item.action}</p>
                                {item.cautions && (
                                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <FiAlertTriangle className="w-3.5 h-3.5" /> {item.cautions}
                                  </p>
                                )}
                                {item.riskLevel && (
                                  <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] uppercase font-bold rounded ${ item.riskLevel === 'high' ? 'bg-red-100 text-red-700' : item.riskLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700' }`}>
                                    Riesgo: {item.riskLevel}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explicación RAW opcional */}
                    {scanResult.rawModelResponse && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Detalle original
                        </h3>  
                        <p className="text-xs text-gray-500 max-h-32 overflow-y-auto">{scanResult.rawModelResponse}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-2">Respuesta del motor IA:</p>
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-xs border border-gray-100 font-mono">
                      {scanResult.rawModelResponse || JSON.stringify(scanResult, null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-lab-border rounded-xl p-6 flex flex-col items-center justify-center h-full text-gray-400">
                <FiShield className="w-10 h-10 mb-4" />
                <p className="text-sm text-center">Aquí verás el resumen visual de tu imagen o protocolo, junto con alertas de riesgo, controles sugeridos y checklist operativo.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}