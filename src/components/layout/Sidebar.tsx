import { useState, useRef, useEffect } from 'react'
import { FiX, FiMenu, FiCpu, FiUploadCloud, FiMic, FiMicOff, FiSend } from 'react-icons/fi'
import { aiService } from '../../services/aiService'

type ScanResult = {
  summary: string
  hazards: string[]
  checklist: { action: string; cautions?: string; riskLevel?: string }[]
}

type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export default function Sidebar() {
  const [open, setOpen] = useState(true)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null)
  const [protocolText, setProtocolText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const listeningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  useEffect(() => {
    return () => {
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const stopCurrentListening = () => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current)
      listeningTimeoutRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      return
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleStartListening = async () => {
    if (isListening) {
      stopCurrentListening()
      return
    }

    setIsListening(true)
    setError('')

    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognitionCtor) {
      try {
        const recognition: BrowserSpeechRecognition = new SpeechRecognitionCtor()
        recognitionRef.current = recognition
        recognition.lang = 'es-MX'
        recognition.continuous = true
        recognition.interimResults = false

        recognition.onresult = (event: any) => {
          const transcripts: string[] = []
          for (let i = event.resultIndex; i < event.results.length; i += 1) {
            const transcript = event.results[i]?.[0]?.transcript?.trim()
            if (transcript) {
              transcripts.push(transcript)
            }
          }
          if (transcripts.length > 0) {
            const chunk = transcripts.join(' ')
            setProtocolText((prev) => `${prev}${prev ? '\n' : ''}${chunk}`)
          }
        }

        recognition.onerror = (event: any) => {
          const code = String(event?.error ?? 'unknown')
          if (code !== 'aborted') {
            setError(`Error de dictado por voz (${code}).`)
          }
        }

        recognition.onend = () => {
          recognitionRef.current = null
          setIsListening(false)
          if (listeningTimeoutRef.current) {
            clearTimeout(listeningTimeoutRef.current)
            listeningTimeoutRef.current = null
          }
        }

        recognition.start()
        listeningTimeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop()
          }
        }, 30000)
        return
      } catch {
        recognitionRef.current = null
      }
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const supportedMimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ].find((mimeType) => MediaRecorder.isTypeSupported(mimeType))

      const mediaRecorder = supportedMimeType
        ? new MediaRecorder(mediaStream, { mimeType: supportedMimeType })
        : new MediaRecorder(mediaStream)

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        })

        mediaStream.getTracks().forEach((track) => track.stop())
        mediaRecorderRef.current = null
        setIsListening(false)
        if (listeningTimeoutRef.current) {
          clearTimeout(listeningTimeoutRef.current)
          listeningTimeoutRef.current = null
        }

        try {
          const transcribedText = await aiService.speechToText(audioBlob)
          setProtocolText((prev) => prev + (prev ? '\n' : '') + transcribedText)
        } catch (err: any) {
          setError('Error al transcribir: ' + (err.message || 'Error desconocido'))
          setIsListening(false)
        }
      }

      mediaRecorder.start()
      listeningTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop()
        }
      }, 30000)
    } catch (err: any) {
      setIsListening(false)
      setError('Acceso al micrófono denegado. Verifica los permisos del navegador.')
      console.error(err)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return
    setImagenFile(file)
    setNombreArchivo(file.name)
    const reader = new FileReader()
    reader.onload = () => setImagenPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) return
    if (file.size > 5 * 1024 * 1024) return
    setImagenFile(file)
    setNombreArchivo(file.name)
    const reader = new FileReader()
    reader.onload = () => setImagenPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const normalizeResult = (result: any): ScanResult => {
    const structured = result?.structured || result || {}
    const hazards = Array.isArray(structured.hazards)
      ? structured.hazards.filter((item: unknown) => typeof item === 'string')
      : []

    const checklist = Array.isArray(structured.checklist)
      ? structured.checklist.map((item: any) => ({
          action: typeof item?.action === 'string' ? item.action : 'Paso sugerido',
          cautions: typeof item?.cautions === 'string' ? item.cautions : undefined,
          riskLevel: typeof item?.riskLevel === 'string' ? item.riskLevel : undefined,
        }))
      : []

    return {
      summary:
        typeof structured.summary === 'string' && structured.summary.trim()
          ? structured.summary
          : 'Análisis completado.',
      hazards,
      checklist,
    }
  }

  const handleScan = async () => {
    if (!protocolText.trim() && !imagenFile) {
      setError('Agrega texto o una imagen antes de escanear.')
      return
    }

    setIsLoading(true)
    setError('')
    setScanResult(null)

    try {
      if (imagenFile) {
        const prompt =
          'Actúa como un Oficial de Seguridad del Laboratorio de alto nivel. Evalúa esta imagen de protocolo o diagrama. Responde siempre en español y en JSON con: { "summary": string, "hazards": string[], "checklist": [{ "action": string, "cautions": string, "riskLevel": "low" | "medium" | "high" }] }. Contexto adicional: ' +
          protocolText
        const result = await aiService.analyzeImage(imagenFile, prompt)
        setScanResult(normalizeResult(result))
      } else {
        const result = await aiService.interpretProtocol(protocolText)
        setScanResult(normalizeResult(result))
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo completar el escaneo.')
    } finally {
      setIsLoading(false)
    }
  }

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
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div
                  className="border-2 border-dashed border-accent/30 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-accent/50 hover:bg-accent/10 transition-all duration-300"
                  onClick={() => inputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {imagenPreview ? (
                    <>
                      <img src={imagenPreview} alt="preview" className="max-h-40 rounded-lg object-contain mb-2" />
                      <span className="text-xs font-mono text-slate-400 truncate max-w-full">{nombreArchivo}</span>
                      <button
                        className="mt-2 text-xs font-mono text-red-400 hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImagenPreview(null)
                          setNombreArchivo(null)
                          setImagenFile(null)
                        }}
                      >
                        Quitar imagen
                      </button>
                    </>
                  ) : (
                    <>
                      <FiUploadCloud className="w-10 h-10 text-accent/60 mb-3" />
                      <span className="text-sm font-mono text-slate-300">Haz clic para subir una imagen del protocolo o equipo</span>
                      <span className="text-xs font-mono text-slate-500 mt-2">PNG, JPG, JPEG (Max 5MB)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Contexto adicional */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                    2. Instrucciones / Contexto Adicional
                  </label>
                  <button
                    onClick={handleStartListening}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all duration-300 ${
                      isListening
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                        : 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20'
                    }`}
                    title={isListening ? 'Detener dictado' : 'Dictar protocolo'}
                  >
                    {isListening ? <FiMicOff className="w-3.5 h-3.5" /> : <FiMic className="w-3.5 h-3.5" />}
                    {isListening ? 'Detener' : 'Dictar'}
                  </button>
                </div>
                <textarea
                  placeholder="Pega texto del protocolo aquí, o presiona el botón de micrófono para dictar con tu voz..."
                  value={protocolText}
                  onChange={(e) => setProtocolText(e.target.value)}
                  className="w-full h-32 p-3 text-sm font-mono bg-[#0a0f1c] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 text-slate-200 placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Botón analizar */}
              <button
                onClick={handleScan}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-white text-sm font-mono font-medium hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
                {isLoading ? 'Escaneando...' : 'Escanear ahora'}
              </button>

              {/* Resultado */}
              <div className="pt-3 border-t border-accent/20">
                {error ? (
                  <div className="text-xs font-mono text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    {error}
                  </div>
                ) : scanResult ? (
                  <div className="space-y-3 text-xs font-mono text-slate-300">
                    <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-accent mb-1">Resumen</p>
                      <p className="leading-relaxed">{scanResult.summary}</p>
                    </div>

                    <div className="bg-[#0a0f1c] border border-accent/20 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-accent mb-2">Riesgos detectados</p>
                      {scanResult.hazards.length > 0 ? (
                        <ul className="space-y-1 list-disc list-inside text-slate-300">
                          {scanResult.hazards.slice(0, 4).map((hazard, idx) => (
                            <li key={`${hazard}-${idx}`}>{hazard}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500">Sin riesgos explícitos en la respuesta.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                      <FiCpu className="w-7 h-7 text-slate-500" />
                    </div>
                    <p className="text-sm font-mono text-slate-400">Aquí verás el resumen visual de tu imagen o protocolo</p>
                    <p className="text-xs font-mono text-slate-500 mt-1">junto con alertas de riesgo y checklist operativo</p>
                  </div>
                )}
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