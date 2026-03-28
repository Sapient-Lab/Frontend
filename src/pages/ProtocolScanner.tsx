import { useEffect, useRef, useState } from 'react';
import { FiAlertTriangle, FiShield, FiUploadCloud, FiImage, FiX, FiMic, FiMicOff, FiCpu } from 'react-icons/fi';
import { aiService } from '../services/aiService';
import TaskRecommendation from '../components/TaskRecommendation';
import type { TaskRecommendationItem } from '../components/TaskRecommendation';
import robotIcon4 from '../assets/robot-icon4.png';

type BrowserSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

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
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const stopCurrentListening = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

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
      stopCurrentListening();
      return;
    }

    setIsListening(true);
    setError('');

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionCtor) {
      try {
        const recognition: BrowserSpeechRecognition = new SpeechRecognitionCtor();
        recognitionRef.current = recognition;
        recognition.lang = 'es-MX';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcripts: string[] = [];
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const transcript = event.results[i]?.[0]?.transcript?.trim();
            if (transcript) {
              transcripts.push(transcript);
            }
          }
          if (transcripts.length > 0) {
            const chunk = transcripts.join(' ');
            setProtocolText((prev) => `${prev}${prev ? '\n' : ''}${chunk}`);
          }
        };

        recognition.onerror = (event: any) => {
          const code = String(event?.error ?? 'unknown');
          if (code !== 'aborted') {
            setError(`Error de dictado por voz (${code}).`);
          }
        };

        recognition.onend = () => {
          recognitionRef.current = null;
          setIsListening(false);
          if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current);
            listeningTimeoutRef.current = null;
          }
        };

        recognition.start();
        listeningTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 30000);
        return;
      } catch {
        recognitionRef.current = null;
      }
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const supportedMimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType));

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(mediaStream, { mimeType: supportedMimeType })
        : new MediaRecorder(mediaStream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        
        mediaStream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current = null;
        setIsListening(false);
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current);
          listeningTimeoutRef.current = null;
        }

        try {
          const transcribedText = await aiService.speechToText(audioBlob);
          setProtocolText(prev => prev + (prev ? '\n' : '') + transcribedText);
        } catch (err: any) {
          setError('Error al transcribir: ' + (err.message || 'Error desconocido'));
          setIsListening(false);
        }
      };

      mediaRecorder.start();
      listeningTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
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

    const flattenHazards = (raw: any): string[] => {
      if (!raw) return [];
      if (typeof raw === 'string') return [raw];
      if (Array.isArray(raw)) {
        return raw.flatMap((item: any) =>
          typeof item === 'string' ? item : Object.values(item).flatMap(flattenHazards)
        );
      }
      return Object.values(raw).flatMap(flattenHazards);
    };

    const formatVal = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return val ? 'Sí' : 'No';
      if (typeof val === 'string') return val;
      if (typeof val === 'number') return String(val);
      if (Array.isArray(val)) return val.map(formatVal).join(', ');
      return Object.entries(val)
        .map(([k, v]) => `${k}: ${typeof v === 'boolean' ? (v ? 'Sí' : 'No') : formatVal(v)}`)
        .join(' · ');
    };

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

  const generateTaskRecommendations = (result: any): TaskRecommendationItem[] => {
    const recommendations: TaskRecommendationItem[] = [];

    if (!result?.structured) return recommendations;

    if (result.structured.hazards && result.structured.hazards.length > 0) {
      recommendations.push({
        title: 'Revisar Peligros Identificados',
        description: `Se detectaron ${result.structured.hazards.length} peligros potenciales en el protocolo. Revisa la lista completa y asegura que todos los controles están implementados.`,
        aiAssigner: 'Visión Mágica',
      });
    }

    if (result.structured.checklist && result.structured.checklist.length > 0) {
      const highRiskItems = result.structured.checklist.filter((item: any) => item.riskLevel === 'high');
      if (highRiskItems.length > 0) {
        recommendations.push({
          title: 'Atender Controles de Alto Riesgo',
          description: `Hay ${highRiskItems.length} control(es) con riesgo alto que requieren atención inmediata antes de proceder.`,
          aiAssigner: 'Visión Mágica',
        });
      }
    }

    if (result.structured.checklist && result.structured.checklist.length > 3) {
      recommendations.push({
        title: 'Completar Checklist de Seguridad',
        description: `Ejecuta todos los pasos del checklist de seguridad preventiva antes de iniciar el procedimiento experimental.`,
        aiAssigner: 'Visión Mágica',
      });
    }

    return recommendations;
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
    <div className="h-full w-full overflow-y-auto relative bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020] p-4 lg:p-6">
      
      {/* Fondo con grid científico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Partículas flotantes */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-gentle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(59,130,246,${Math.random() * 0.3 + 0.1}), rgba(139,92,246,${Math.random() * 0.15}))`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 20 + 15}s`,
          }}
        />
      ))}
      
      {/* Efecto de glow que sigue al mouse */}
      <div 
        className="fixed w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none transition-all duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.07), rgba(139,92,246,0.03), transparent 70%)',
          left: mousePosition.x - 200,
          top: mousePosition.y - 200,
        }}
      />
      
      <div className="relative z-10 w-full mx-auto">
        
        {/* Header con Robot Escaneando - CENTRADO VERTICALMENTE con robot grande */}
        <div className="flex items-center justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                <FiCpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Visión Mágica
                </h1>
                <p className="text-xs font-mono text-accent tracking-wider">ANÁLISIS VISUAL POR IA</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-mono mt-1 max-w-2xl">
              Sube una imagen de un manual, tubo de ensayo, esquema de laboratorio o protocolo. La IA lo interpretará usando visión computacional para darte un resumen.
            </p>
          </div>
          
          {/* Robot Escaneando - TAMAÑO GRANDE centrado */}
          <div className="hidden lg:block relative flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-full blur-xl animate-pulse-slow" />
            <img 
              src={robotIcon4} 
              alt="Robot escaneando documentos"
              className="w-80 h-80 lg:w-60 lg:h-60 object-contain relative z-10 animate-float-robot hover:scale-110 transition-transform duration-500 cursor-pointer"
            />
            <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-accent rounded-full animate-ping" />
            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-accent rounded-full animate-pulse" />
            <div className="absolute top-1/2 -right-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-500" />
          </div>
        </div>

        <div className="flex flex-col gap-8 w-full">
          
          {/* Input Panel */}
          <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500">
            
            {/* Image Upload Zone */}
            <div className="mb-4">
              <label className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider mb-3 block">
                1. Adjuntar Evidencia Gráfica (Opcional)
              </label>
              {!imagePreview ? (
                <div 
                  className="border-2 border-dashed border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                    <FiUploadCloud className="w-6 h-6 text-accent/60" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-medium">Haz clic para subir una imagen del protocolo o equipo</span>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">PNG, JPG, JPEG (Max 5MB)</span>
                </div>
              ) : (
                <div className="relative border border-accent/20 rounded-xl p-2 bg-accent/5">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg opacity-90" />
                  <button 
                    onClick={clearImage}
                    className="absolute top-3 right-3 bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-all shadow-lg"
                    title="Quitar imagen"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[9px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
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
              <h2 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">2. Instrucciones / Contexto Adicional</h2>
              <button
                onClick={handleStartListening}
                type="button"
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-medium flex items-center gap-2 transition-all duration-300 ${
                  isListening
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                    : 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20'
                }`}
                title="Dictar protocolo (máx 30s)"
              >
                {isListening ? (
                  <>
                    <FiMicOff className="w-3 h-3" /> Detener
                  </>
                ) : (
                  <>
                    <FiMic className="w-3 h-3" /> Dictar
                  </>
                )}
              </button>
            </div>
            <textarea
              className="w-full flex-1 min-h-[160px] p-4 text-sm font-mono bg-[#0a0f1c] border border-accent/20 rounded-xl resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-slate-200 placeholder:text-slate-600 transition-all"
              placeholder="Pega texto del protocolo aquí, o presiona el botón de micrófono para dictar con tu voz..."
              value={protocolText}
              onChange={(e) => setProtocolText(e.target.value)}
            />
            {error && (
              <p className="mt-3 text-xs font-mono text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                {error}
              </p>
            )}
            <button
              onClick={handleScan}
              disabled={isLoading}
              className={`mt-4 w-full py-3 rounded-xl text-sm font-mono font-medium transition-all duration-300 text-white ${
                isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-accent to-purple-600 hover:shadow-lg hover:shadow-accent/30'
              }`}
            >
              {isLoading ? 'Analizando con Visión IA...' : 'Escanear ahora'}
            </button>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col">
            {scanResult ? (
              <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="px-6 pt-5 pb-2 shrink-0 border-b border-accent/20">
                  <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest">Resultado del análisis</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[520px] px-6 py-5 custom-scrollbar">
                {scanResult.structured ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-2">
                        Resumen del Análisis Visual
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{scanResult.structured.summary}</p>
                    </div>

                    {scanResult.structured.hazards && scanResult.structured.hazards.length > 0 && (
                      <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                        <h3 className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <FiAlertTriangle className="w-3 h-3" /> Riesgos detectados
                        </h3>
                        <ul className="list-disc pl-4 text-sm text-red-300 space-y-1">
                          {scanResult.structured.hazards.map((hazard: string, idx: number) => (
                            <li key={idx}>{hazard}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {scanResult.structured.checklist && scanResult.structured.checklist.length > 0 && (
                      <div>
                        <h3 className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-3">
                          Seguridad preventiva
                        </h3>
                        <div className="space-y-2">
                          {scanResult.structured.checklist.map((item: any, idx: number) => {
                            const risk = item.riskLevel;
                            const borderColor = risk === 'high' ? 'border-l-red-500' : risk === 'medium' ? 'border-l-orange-500' : 'border-l-emerald-500';
                            const riskLabel = risk === 'high' ? 'Alto' : risk === 'medium' ? 'Medio' : risk === 'low' ? 'Bajo' : null;
                            const riskBadge = risk === 'high' ? 'bg-red-500/20 text-red-400' : risk === 'medium' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400';
                            return (
                              <div key={idx} className={`flex items-start gap-3 p-3 bg-accent/5 rounded-xl border border-accent/20 border-l-4 ${borderColor} transition-all group hover:bg-accent/10`}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-mono font-medium text-slate-200 leading-snug">{item.action}</p>
                                  {item.cautions && (
                                    <p className="text-xs text-orange-400 mt-1 flex items-start gap-1">
                                      <FiAlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                      <span>{item.cautions}</span>
                                    </p>
                                  )}
                                  {riskLabel && (
                                    <span className={`inline-block mt-1.5 px-2 py-0.5 text-[9px] font-mono font-bold rounded-full ${riskBadge}`}>
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

                    {generateTaskRecommendations(scanResult).length > 0 && (
                      <div className="mt-6 pt-4 border-t border-accent/20">
                        <h3 className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-3">
                          Tareas Sugeridas
                        </h3>
                        <TaskRecommendation recommendations={generateTaskRecommendations(scanResult)} />
                      </div>
                    )}

                    {scanResult.rawModelResponse && (
                      <div className="mt-4 pt-4 border-t border-accent/20">
                        <h3 className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest mb-2">
                            Detalle original
                        </h3>  
                        <p className="text-[10px] font-mono text-slate-500 max-h-32 overflow-y-auto">{scanResult.rawModelResponse}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400">
                    <p className="font-mono font-semibold mb-2">Respuesta del motor IA:</p>
                    <pre className="whitespace-pre-wrap bg-accent/5 p-4 rounded-lg text-[10px] font-mono border border-accent/20">
                      {scanResult.rawModelResponse || JSON.stringify(scanResult, null, 2)}
                    </pre>
                  </div>
                )}
                </div>
              </div>
            ) : (
              <div className="bg-[#0f1624]/80 backdrop-blur-sm border-2 border-dashed border-accent/20 rounded-xl p-6 flex flex-col items-center justify-center h-full text-slate-500">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <FiShield className="w-8 h-8 text-accent/40" />
                </div>
                <p className="text-xs font-mono text-center">Aquí verás el resumen visual de tu imagen o protocolo, junto con alertas de riesgo, controles sugeridos y checklist operativo.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-15px) translateX(8px);
            opacity: 0.5;
          }
        }
        
        @keyframes float-robot {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        
        .animate-float-robot {
          animation: float-robot 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
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
    </div>
  );
}