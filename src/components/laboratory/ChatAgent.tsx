import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import RecordRTC from 'recordrtc';
import { aiService, type ChatMessage } from '../../services/aiService';
import { useProject } from '../../context/ProjectContext';

interface ChatAgentProps {
  onInsertCode?: (code: string) => void;
  editorContext?: string;
}

export default function ChatAgent({ onInsertCode, editorContext }: ChatAgentProps) {
  const { projectGoal, projectDesc } = useProject();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hola. Soy tu Agente IA alojado en Mistral/DeepSeek. ¿En qué te puedo ayudar hoy con tu proyecto?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<RecordRTC | null>(null);

  // Inyectar el projectGoal y projectDesc como mensaje de sistema
  useEffect(() => {
    if ((projectGoal || projectDesc) && messages.length === 1) {
      setMessages(prev => [
        { role: 'system', content: `Contexto del Proyecto del usuario:\nDescripción: ${projectDesc}\nObjetivo: ${projectGoal}\n` },
        ...prev
      ]);
    }
  }, [projectGoal, projectDesc]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newChatMsg: ChatMessage = { role: 'user', content: userMessage };
    
    // Si hay código en el editor, mandamos un mensaje contextual "invisible" o extendemos el prompt
    let contextualizedMessage = userMessage;
    if (editorContext) {
      contextualizedMessage = `[Contexto actual del archivo abierto en el Editor:\n\`\`\`javascript\n${editorContext}\n\`\`\`]\n\nPregunta/Instrucción del usuario: ${userMessage}`;
    }

    const updatedMessages = [...messages, { role: 'user', content: contextualizedMessage } as ChatMessage];
    
    setMessages([...messages, newChatMsg]); // Mostramos el msj limpio en UI
    setIsLoading(true);

    try {
      // Pasamos el historial completo de mensajes al backend para mantener contexto
      const response = await aiService.sendMessage(contextualizedMessage, updatedMessages);

      const answer = response.rawModelResponse || response.answer || response.text || response.content || JSON.stringify(response);

      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);

      // Auto-insertar el primer bloque de código JS/TS detectado
      const codeMatch = answer.match(/```(?:javascript|js|typescript|ts)\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1] && onInsertCode) {
        onInsertCode(codeMatch[1].trimEnd());
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al conectar con el backend. Verifica que el servidor NestJS esté corriendo en el puerto 3000.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convertir archivo a Base64 para el vision
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result?.toString().replace(/^data:image\/[a-z]+;base64,/, '');
      if (base64String) {
        setMessages(prev => [...prev, { role: 'user', content: '[Imagen adjuntada]' }]);
        setIsLoading(true);
        try {
          // Llama al endpoint de visión
          // Reconstruir data URL completa para el endpoint
          const dataUrl = `data:image/jpeg;base64,${base64String}`;
          const response = await aiService.analyzeImage(dataUrl, "Revisa esta imagen del laboratorio y detecta anomalías o peligros.");
          const answerText = response.structured?.narrativeSummary || response.rawModelResponse || JSON.stringify(response);
          setMessages(prev => [...prev, { role: 'assistant', content: answerText }]);
        } catch (error: any) {
           setMessages(prev => [...prev, { role: 'assistant', content: 'Error al procesar la imagen: ' + error.message}]);
        } finally {
          setIsLoading(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessages(prev => [...prev, { role: 'user', content: `📄 [Documento adjuntado: ${file.name}]` }]);
    setIsLoading(true);

    try {
      const response = await aiService.analyzeDocument(file);
      
      let answerText = "Se ha analizado el documento con Azure Document Intelligence.\n\n";
      if (response && response.content) {
         answerText += `**Contenido extraído:**\n\n${response.content}`;
      } else {
         answerText += JSON.stringify(response);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: answerText }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al procesar el documento: ' + error.message }]);
    } finally {
      setIsLoading(false);
      e.target.value = ''; // Reset input
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        desiredSampRate: 16000,
        numberOfAudioChannels: 1
      });
      recorderRef.current.startRecording();
      // Guardo temporalmente la referencia del stream en recorderRef
      (recorderRef.current as any).stream = stream;
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("No se pudo acceder al micrófono. Asegúrate de dar los permisos correspondientes.");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    
    recorderRef.current.stopRecording(async () => {
      setIsRecording(false);
      setIsLoading(true);
      
      const audioBlob = recorderRef.current!.getBlob();
      
      // Stop stream tracks
      const stream = (recorderRef.current as any).stream;
      if (stream) {
         stream.getTracks().forEach((track: any) => track.stop());
      }
      recorderRef.current!.destroy();
      recorderRef.current = null;

      try {
        setMessages(prev => [...prev, { role: 'user', content: '🎤 [Procesando dictado...]' }]);
        
        // Usar AI Service de Speech
        const response = await aiService.speechToText(audioBlob);
        
        const transcribedText = response.text || "No se detectó texto (Azure no devolvió palabras)";
        
        // Actualizar el mensaje de usuario que decía [Procesando dictado]
        setMessages(prev => {
           const newMsg = [...prev];
           newMsg[newMsg.length - 1] = { role: 'user', content: `🎤 (Dictado): "${transcribedText}"` };
           return newMsg;
        });

        if (transcribedText && transcribedText.length > 5 && !transcribedText.includes("No se detectó")) {
          // Si hubo texto real, mandamos ese texto como input automático a la IA conversacional
          const contextualizedMessage = editorContext 
            ? `[Contexto actual del archivo abierto en el Editor:\n\`\`\`javascript\n${editorContext}\n\`\`\`]\n\nPregunta/Instrucción del usuario (Por Voz): ${transcribedText}`
            : transcribedText;

          const chatResponse = await aiService.sendMessage(contextualizedMessage, messages);
          const answer = chatResponse.rawModelResponse || chatResponse.answer || chatResponse.text || chatResponse.content || JSON.stringify(chatResponse);
          
          setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        }

      } catch (err: any) {
         setMessages(prev => [...prev, { role: 'assistant', content: 'Error de dictado por voz: ' + err.message }]);
      } finally {
         setIsLoading(false);
      }
    });
  };

  const toggleRecording = () => {
     if (isRecording) {
        stopRecording();
     } else {
        startRecording();
     }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#fbfbfb]">
      {/* Zona de mensajes */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-lg text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-br-none' 
                  : 'bg-white border border-lab-border text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1 border-b border-gray-100 pb-1 w-fit">
                  <span className="text-[10px] uppercase font-bold text-accent">Agente IA</span>
                </div>
              )}
              {msg.role === 'assistant' ? (
                <div className="text-sm prose max-w-none prose-pre:bg-[#0d1117] prose-pre:text-gray-300 prose-p:leading-relaxed">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        return !inline && match ? (
                          <div className="relative mt-2 mb-4 group shadow-sm border border-gray-200 rounded-md overflow-hidden">
                            <div className="flex justify-between items-center text-xs py-1.5 px-3 bg-gray-100 border-b border-gray-200">
                              <span className="font-mono text-[10px] uppercase font-bold text-gray-700">
                                {match[1]}
                              </span>
                              <button
                                onClick={() => onInsertCode && onInsertCode(codeString)}
                                className="bg-accent text-white px-2 py-1 rounded-sm text-[10px] hover:bg-accent-dim transition-colors"
                              >
                                Insertar al Editor
                              </button>
                            </div>
                            <pre className="bg-[#0d1117] text-gray-300 p-3 overflow-x-auto text-[13px] m-0">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          </div>
                        ) : (
                          <code className="bg-gray-100 text-[#0366d6] px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-lab-border text-gray-400 p-3 rounded-lg rounded-bl-none text-sm flex gap-1 items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-lab-border flex gap-2 items-center">
        {/* Document (PDF) Upload */}
        <label className="cursor-pointer text-gray-500 hover:text-accent p-2 rounded hover:bg-gray-50 transition-colors" title="Subir Reporte PDF (Azure Document)">
          <input type="file" accept="application/pdf,image/*" className="hidden" onChange={handleDocumentUpload} disabled={isLoading} />
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             {/* Paperclip icon */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </label>

        {/* Image / Vision Upload */}
        <label className="cursor-pointer text-gray-500 hover:text-accent p-2 rounded hover:bg-gray-50 transition-colors" title="Subir Imagen (Azure Vision)">
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {/* Photograph icon */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </label>
        
        {/* Voice Dictation Button (Azure Speech) */}
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isLoading && !isRecording}
          className={`p-2 rounded transition-colors ${
            isRecording 
              ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' 
              : 'text-gray-500 hover:text-accent hover:bg-gray-50'
          }`}
          title="Dictar por voz (Azure Speech)"
        >
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Habla a la IA o sube una foto de tu código/experimento..."
          className="flex-1 bg-lab-bg text-sm px-3 py-2 rounded-full border border-lab-border focus:outline-none focus:border-accent"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="bg-accent text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-accent-dim disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}