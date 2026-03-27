import { useState, useEffect, useRef } from 'react';
import { FiFileText, FiUploadCloud, FiMessageSquare, FiSend, FiLoader, FiBook, FiCpu } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';
import { aiService } from '../services/aiService';

type LocalFile = {
  id: string;
  name: string;
  size: number;
};

type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
};

export default function Resources() {
  const { projectId } = useProject();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);

  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  useEffect(() => {
    const loadRecentFiles = () => {
      if (!projectId) {
        console.warn('⚠️ No projectId available for Material Reciente');
        setLocalFiles([]);
        return;
      }
      
      const storageKey = `sapientlab_recent_files_project_${projectId}`;
      const savedFiles = localStorage.getItem(storageKey);
      console.log(`🔍 Material Reciente para proyecto ${projectId}:`, savedFiles);
      
      if (savedFiles) {
        try {
          const files = JSON.parse(savedFiles);
          if (Array.isArray(files)) {
            setLocalFiles(files);
            console.log(`✅ Material Reciente cargado para proyecto ${projectId}:`, files.length, 'archivos');
          } else {
            console.warn('⚠️ Material Reciente no es un array:', files);
            setLocalFiles([]);
          }
        } catch (err) {
          console.error('❌ Error al parsear Material Reciente:', err);
          setLocalFiles([]);
        }
      } else {
        console.log(`ℹ️ No hay Material Reciente para proyecto ${projectId}`);
        setLocalFiles([]);
      }
    };

    loadRecentFiles();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `sapientlab_recent_files_project_${projectId}`) {
        console.log(`🔄 Cambio detectado en Material Reciente para proyecto ${projectId}`);
        loadRecentFiles();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [projectId]);

  const handleFileUpload = async (files: File[]) => {
    if (!projectId) {
      console.error('❌ Cannot upload files without projectId');
      return;
    }
    
    const newFiles = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: f.size
    }));
    
    setLocalFiles(prev => {
      const allFiles = [...prev, ...newFiles];
      const limitedFiles = allFiles.slice(-20);
      
      const storageKey = `sapientlab_recent_files_project_${projectId}`;
      localStorage.setItem(storageKey, JSON.stringify(limitedFiles));
      console.log(`Material Reciente actualizado para proyecto ${projectId}:`, limitedFiles);
      
      return limitedFiles;
    });

    try {
      await aiService.uploadProjectDocuments(files, projectId?.toString());
      console.log('Documentos reportados al backend para embeddings.');
    } catch (e) {
      console.error('Error subiendo documento al backend:', e);
    }
  };

  const renderFormattedMessage = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, idx) => {
          if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-') || paragraph.trim().startsWith('*')) {
            const lines = paragraph.split('\n').map(line => line.trim()).filter(l => l);
            return (
              <ul key={idx} className="list-disc list-inside space-y-1">
                {lines.map((line, lineIdx) => (
                  <li key={lineIdx} className="ml-1">
                    {line.replace(/^[•\-*]\s*/, '')}
                  </li>
                ))}
              </ul>
            );
          }
          
          if (/^\d+\./.test(paragraph.trim())) {
            const lines = paragraph.split('\n').map(line => line.trim()).filter(l => l);
            return (
              <ol key={idx} className="list-decimal list-inside space-y-1">
                {lines.map((line, lineIdx) => (
                  <li key={lineIdx} className="ml-1">
                    {line.replace(/^\d+\.\s*/, '')}
                  </li>
                ))}
              </ol>
            );
          }
          
          const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={idx} className="text-sm leading-relaxed">
              {parts.map((part, partIdx) => 
                part.startsWith('**') ? (
                  <strong key={partIdx} className="font-semibold">
                    {part.replace(/\*\*/g, '')}
                  </strong>
                ) : (
                  <span key={partIdx}>{part}</span>
                )
              )}
            </p>
          );
        })}
      </div>
    );
  };

  const handleChatSubmit = async () => {
    if (!chatQuery.trim() || isChatLoading) return;
    
    const userMsg = chatQuery.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatQuery('');
    setIsChatLoading(true);

    try {
      const documentNames = localFiles.map(f => f.name);
      const aiResponse = await aiService.documentChat(userMsg, documentNames);
      
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: aiResponse
        }
      ]);
    } catch (error) {
      console.error('Error in documentChat:', error);
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: 'Error al procesar tu pregunta. Intenta de nuevo más tarde.' 
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto relative bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020] p-6 lg:p-8">
      
      {/* Fondo con grid científico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Partículas flotantes */}
      {[...Array(25)].map((_, i) => (
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
      
      <div className="relative z-10 flex flex-col lg:flex-row gap-6">
        
        {/* IZQUIERDA: Area de Asistente Documental */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                <FiBook className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Escaneo de Documentos
                </h1>
                <p className="text-xs font-mono text-accent tracking-wider">BIBLIOTECA INTELIGENTE</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Sube documentos y consulta a tu IA privada para que lea tus manuales, normativas o papers automáticamente.
            </p>
          </div>

          {/* CHAT AI AREA - Estilo científico */}
          <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl flex flex-col mb-8 shadow-lg hover:shadow-2xl transition-all duration-500 h-[400px]">
            <div className="bg-accent/10 p-4 border-b border-accent/20 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                  <FiCpu className="w-4 h-4 text-white" />
                </div>
                <span className="font-mono font-bold text-accent text-sm">Asistente Documental</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-slate-500">online</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={chatScrollRef}>
              {chatHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 mt-2 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                    <FiBook className="w-8 h-8 text-accent/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-mono font-medium text-slate-300 mb-1">Asistente de Documentos</p>
                    <p className="text-[11px] font-mono text-slate-500 max-w-sm">Sube PDFs o documentos y hazle preguntas. Tu IA privada evaluará el contenido automáticamente.</p>
                  </div>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-r from-accent to-purple-600 text-white rounded-br-sm shadow-lg' 
                      : 'bg-accent/10 border border-accent/20 text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="leading-relaxed font-mono text-sm">{msg.content}</p>
                    ) : (
                      renderFormattedMessage(msg.content)
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-accent/10 border border-accent/20 text-slate-200 p-3 rounded-xl text-sm rounded-bl-sm flex items-center gap-2">
                    <FiLoader className="animate-spin" /> Escaneando tu biblioteca...
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-accent/20 bg-accent/5 rounded-b-xl flex gap-2">
              <input 
                type="text" 
                value={chatQuery}
                onChange={e => setChatQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Pregunta sobre el contenido de tus documentos..." 
                className="flex-1 px-4 py-2.5 bg-[#0a0f1c] border border-accent/20 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all"
              />
              <button 
                onClick={handleChatSubmit} 
                disabled={!chatQuery.trim() || isChatLoading} 
                className="px-4 py-2.5 bg-gradient-to-r from-accent to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-accent/30 disabled:opacity-50 flex items-center justify-center transition-all duration-300"
              >
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* DERECHA: Drag & Drop Dropzone */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
          
          {/* Dropzone */}
          <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
                <FiUploadCloud className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-mono font-bold text-accent text-sm uppercase tracking-wider">Aportar a tu Biblioteca</h3>
            </div>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  handleFileUpload(Array.from(e.dataTransfer.files));
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
                isDragging ? 'border-accent bg-accent/10' : 'border-accent/30 hover:border-accent/50 hover:bg-accent/5'
              }`}
            >
              <div className={`p-3 rounded-full mb-3 transition-all duration-300 ${isDragging ? 'bg-accent/20' : 'bg-accent/10 group-hover:bg-accent/20'}`}>
                <FiUploadCloud className={`w-6 h-6 ${isDragging ? 'text-accent' : 'text-slate-500'}`} />
              </div>
              <span className="text-sm font-mono font-semibold text-slate-300">Arrastra archivos aquí</span>
              <span className="text-[10px] font-mono text-slate-500 mt-1">o haz clic para explorar</span>
              <span className="text-[9px] font-mono text-slate-600 mt-4 px-2 py-1 bg-accent/10 rounded-full border border-accent/20">Soporta: PDF, DOCX, TXT</span>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(Array.from(e.target.files));
                }}
              />
            </div>
          </div>

          {/* Lista de Documentos Locales Subidos */}
          <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono font-bold text-accent text-sm uppercase tracking-wider">Material Reciente</h3>
              <span className="text-[9px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">{localFiles.length}</span>
            </div>
            
            {localFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-3">
                  <FiFileText className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-xs font-mono text-slate-500">Aún no has nutrido tu espacio de trabajo con PDFs.</p>
              </div>
            ) : (
              <ul className="space-y-2 overflow-y-auto max-h-[280px] pr-1 custom-scrollbar">
                {localFiles.map(f => (
                  <li key={f.id} className="flex items-center gap-3 bg-accent/5 border border-accent/20 p-2.5 rounded-lg hover:bg-accent/10 hover:border-accent/40 transition-all duration-300 group">
                    <div className="bg-[#0a0f1c] p-1.5 rounded-lg border border-accent/20 shadow-sm shrink-0">
                      <FiFileText className="text-accent w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-mono font-semibold text-slate-300 truncate group-hover:text-slate-200 transition-colors" title={f.name}>{f.name}</p>
                      <p className="text-[8px] font-mono text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </li>
                ))}
              </ul>
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
        
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
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