import { useState, useRef } from 'react';
import { FiAlertTriangle, FiShield, FiUploadCloud, FiImage, FiX, FiMic, FiMicOff } from 'react-icons/fi';
import { aiService } from '../services/aiService';

export default function ProtocolScanner() {
  const [protocolText, setProtocolText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

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
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartListening = async () => {
    if (isListening) {
      // Detener grabación
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    setIsListening(true);
    setError('');

    try {
      // Solicitar acceso al micrófono
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        
        // Detener stream
        mediaStream.getTracks().forEach(track => track.stop());
        setIsListening(false);

        // Enviar al backend para transcribir
        try {
          const transcribedText = await aiService.speechToText(audioBlob);
          setProtocolText(prev => prev + (prev ? '\n' : '') + transcribedText);
        } catch (err: any) {
          setError('Error al transcribir: ' + (err.message || 'Error desconocido'));
          setIsListening(false);
        }
      };

      mediaRecorder.start();

      // Detener grabación después de 30 segundos
      setTimeout(() => {
        if (mediaRecorderRef.current && isListening) {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    } catch (err: any) {
      setIsListening(false);
      setError('Acceso al micrófono denegado. Verifica los permisos del navegador.');
      console.error(err);
    }
  };

  const normalizeResult = (result: any) => {
    const structured = result.structured || result;

    // Aplana hazards: puede ser string, array de strings, array de objetos,
    // u objeto con claves como { chemicalHazards, physicalHazards, ... }
    const flattenHazards = (raw: any): string[] => {
      if (!raw) return [];
      if (typeof raw === 'string') return [raw];
      if (Array.isArray(raw)) {
        return raw.flatMap((item: any) =>
          typeof item === 'string' ? item : Object.values(item).flatMap(flattenHazards)
        );
      }
      // Es un objeto plano — extraer todos los valores recursivamente
      return Object.values(raw).flatMap(flattenHazards);
    };

    // Formatea un valor cualquiera a texto legible
    const formatVal = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return val ? 'Sí' : 'No';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) return val.map(formatVal).join(', ');
      // Objeto — mostrar pares clave: valor
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? '✓' : '✗') : formatVal(v)}`)
        .join(' · ');
    };

    // Normaliza checklist: cada ítem puede ser string u objeto { action, cautions, riskLevel }
    const flattenChecklist = (raw: any): { action: string; cautions?: string; riskLevel?: string }[] => {
      if (!raw) return [];
      if (typeof raw === 'string') return [{ action: raw }];
      if (Array.isArray(raw)) {
        return raw.map((item: any) => {
          if (typeof item === 'string') return { action: item };
          return {
            action: typeof item.action === 'string' ? item.action : formatVal(item.action ?? item),
            cautions: item.cautions ? formatVal(item.cautions) : undefined,
            riskLevel: item.riskLevel,
          };
        });
      }
      // Objeto plano — cada clave es un ítem del checklist
      return Object.entries(raw).map(([key, val]) => ({
        action: `${key}: ${formatVal(val)}`
      }));
    };

    return {
      structured: {
        summary: structured.summary || result.rawModelResponse || 'Análisis completado.',
        hazards: flattenHazards(structured.hazards),
        checklist: flattenChecklist(structured.checklist),
      },
      rawModelResponse: result.rawModelResponse,
    };
  };

  const handleScan = async () => {
    if (!protocolText.trim() && !imageFile) {
      setError('Por favor, pega el protocolo o sube una imagen.');
      return;
    }

    setIsLoading(true);
    setError('');
    setScanResult(null);

    try {
      if (imageFile) {
        const prompt = "Actúa como un Oficial de Seguridad del Laboratorio de alto nivel. Evalúa esta imagen del protocolo, instrucciones químicas o diagrama experimental. IMPORTANTE: Responde SIEMPRE en español.\nSi hay texto, tenlo en cuenta: " + protocolText + "\nResponde únicamente en formato JSON con esta estructura exacta: { \"summary\": string, \"hazards\": string[], \"checklist\": [{ \"action\": string, \"cautions\": string, \"riskLevel\": \"low\" | \"medium\" | \"high\" }] }. Todos los valores deben ser texto en español, no objetos anidados.";
        
        // Modo 3: enviar el archivo local directamente como multipart/form-data
        const result = await aiService.analyzeImage(imageFile, prompt);
        
        setScanResult(normalizeResult(result));
      } else {
        const result = await aiService.interpretProtocol(protocolText);
        setScanResult(normalizeResult(result));
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto w-full p-4 lg:p-6 page-fade-in">
      <div className="w-full mx-auto">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
            Visión Mágica
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sube una imagen de un manual, tubo de ensayo, esquema de laboratorio o protocolo. La IA lo interpretará usando visión computacional para darte un resumen.
          </p>
        </div>

        <div className="flex flex-col gap-8 w-full">
          
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
            
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-gray-700">2. Instrucciones / Contexto Adicional</h2>
              <button
                onClick={handleStartListening}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-2 transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
                title="Dictar protocolo (máx 30s)"
              >
                {isListening ? (
                  <>
                    <FiMicOff className="w-4 h-4" /> Detener
                  </>
                ) : (
                  <>
                    <FiMic className="w-4 h-4" /> 🎙️ Dictar
                  </>
                )}
              </button>
            </div>
            <textarea
              className="w-full flex-1 min-h-[160px] p-4 text-sm font-sans bg-gray-50 border border-lab-border rounded-lg resize-none focus:outline-none focus:border-accent"
              placeholder="Pega texto del protocolo aquí, o presiona 🎙️ para dictar con tu voz..."
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
              <div className="bg-white border border-lab-border rounded-xl shadow-sm flex flex-col animate-in fade-in stagger-in" style={{ animationDelay: '80ms' }}>
                <div className="px-6 pt-5 pb-2 shrink-0 border-b border-gray-100">
                  <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Resultado del análisis</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[520px] px-6 py-5">
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
                          Seguridad preventiva
                        </h3>
                        <div className="space-y-2">
                          {scanResult.structured.checklist.map((item: any, idx: number) => {
                            const risk = item.riskLevel;
                            const borderColor = risk === 'high' ? 'border-l-red-400' : risk === 'medium' ? 'border-l-orange-400' : 'border-l-green-400';
                            const riskLabel = risk === 'high' ? 'Alto' : risk === 'medium' ? 'Medio' : risk === 'low' ? 'Bajo' : null;
                            const riskBadge = risk === 'high' ? 'bg-red-100 text-red-700' : risk === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700';
                            return (
                              <div key={idx} className={`flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 border-l-4 ${borderColor} transition-colors group`}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-800 leading-snug">{item.action}</p>
                                  {item.cautions && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-start gap-1">
                                      <FiAlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                      <span>{item.cautions}</span>
                                    </p>
                                  )}
                                  {riskLabel && (
                                    <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded ${riskBadge}`}>
                                      Riesgo {riskLabel}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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