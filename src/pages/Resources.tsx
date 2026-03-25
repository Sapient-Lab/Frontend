import { useState, useEffect, useRef } from 'react';
import type { IconType } from 'react-icons';
import { FiCode, FiFileText, FiLink2, FiPlayCircle, FiSearch, FiUploadCloud, FiMessageSquare, FiSend, FiLoader, FiBook } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';
import { aiService } from '../services/aiService';

type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'repo';
  description: string;
  module: string;
  url?: string;
};

const typeIcons: Record<Resource['type'], IconType> = {
  pdf: FiFileText,
  link: FiLink2,
  video: FiPlayCircle,
  repo: FiCode,
};

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
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('Todos');
  const [loading, setLoading] = useState(true);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);

  // Scholar Chat state
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatHistory, isChatLoading]);

  useEffect(() => {
    fetch('http://localhost:3000/api/platform/resources')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((item: any) => ({
          ...item,
          module: `Módulo ${item.module}`,
          description: Array.isArray(item.tags) ? item.tags.join(', ') : 'Sin descripción'
        }));
        setResources(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (files: File[]) => {
    // Frontend Update
    const newFiles = files.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name,
      size: f.size
    }));
    setLocalFiles(prev => [...prev, ...newFiles]);

    // Backend Request
    try {
      await aiService.uploadProjectDocuments(files, projectId?.toString());
      console.log('Documentos reportados al backend para embeddings.');
    } catch (e) {
      console.error('Error subiendo documento al backend:', e);
    }
  };

  const handleChatSubmit = () => {
    if (!chatQuery.trim() || isChatLoading) return;
    
    const userMsg = chatQuery.trim();
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatQuery('');
    setIsChatLoading(true);

    // Mock API Call - En un futuro llamará al endpoint /api/docs/chat detallado en backend-reqs-docs.md
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: localFiles.length > 0 
            ? `Analizando tus documentos recientes (como ${localFiles[0].name})...\n\nBasado en la literatura de tu proyecto: No se han encontrado restricciones graves. Para este manual debes mantener el equipo por debajo de 4°C y utilizar equipo de protección clase A.` 
            : 'Parece que no tienes documentos subidos aún. Sube un PDF a la derecha para que pueda leerlo y ayudarte mejor.' 
        }
      ]);
      setIsChatLoading(false);
    }, 1500);
  };

  const modules = ['Todos', ...Array.from(new Set(resources.map(r => r.module)))];

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = filterModule === 'Todos' || r.module === filterModule;
    return matchSearch && matchModule;
  });

  return (
    <div className="h-full w-full overflow-y-auto bg-[#fbfbfb] p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
      
      {/* IZQUIERDA: Area de Google Scholar Interno y Biblioteca */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2 flex items-center gap-2">
            <FiBook className="text-accent" /> Escaneo de Documentos
          </h1>
          <p className="text-sm text-gray-500">
            Sube documentos y consulta a tu IA privada para que lea tus manuales, normativas o papers automáticamente.
          </p>
        </div>

        {/* CHAT AI AREA (Scholar) */}
        <div className="bg-white border border-accent/20 rounded-xl flex flex-col mb-8 shadow-sm flex-shrink-0 h-[350px]">
          <div className="bg-accent/5 p-3 border-b border-lab-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiMessageSquare className="text-accent" />
              <span className="font-semibold text-accent text-sm">Asistente Documental</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-2 space-y-3">
                <FiBook className="w-10 h-10 opacity-20" />
                <p className="text-sm text-center max-w-sm">Hazme una pregunta sobre tus PDFs.</p>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-white rounded-br-sm shadow-md' : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'}`}>
                  {msg.content.split('\n').map((line, j) => (
                    <span key={j}>{line}<br/></span>
                  ))}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-xl text-sm rounded-bl-sm border border-gray-200 flex items-center gap-2">
                  <FiLoader className="animate-spin" /> Escaneando tu biblioteca...
                </div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-lab-border bg-gray-50 flex gap-2 rounded-b-xl">
            <input 
              type="text" 
              value={chatQuery}
              onChange={e => setChatQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Pregunta sobre el contenido de tus documentos..." 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm transition-shadow"
            />
            <button 
              onClick={handleChatSubmit} 
              disabled={!chatQuery.trim() || isChatLoading} 
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dim disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Buscador y Filtros para la vista tradicional inferior */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar en la base de datos general por protocolo, riesgo o palabra..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-lab-border text-sm rounded-lg focus:outline-none focus:border-accent shadow-sm"
            />
          </div>
          <select 
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-white border border-lab-border text-sm rounded-lg focus:outline-none focus:border-accent shadow-sm"
          >
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Grid de Recursos Clásicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 auto-rows-max pb-8">
          {loading ? (
            <div className="col-span-full py-8 text-center text-gray-400 text-sm">
              Cargando recursos de la nube...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-8 text-center text-gray-400 text-sm border border-dashed rounded-xl border-gray-200">
              No se encontraron recursos clásicos para tu búsqueda.
            </div>
          ) : (
            filtered.map(resource => (
              <div key={resource.id} className="bg-white border border-lab-border p-4 rounded-xl flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden">
                {(() => {
                  const ResourceIcon = typeIcons[resource.type] || FiFileText;
                  return (
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl bg-gray-50 w-9 h-9 flex items-center justify-center rounded-lg border border-gray-100 group-hover:scale-105 transition-transform">
                          <ResourceIcon className="w-4 h-4 text-gray-700" />
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-accent-light text-accent px-2 py-1 rounded">
                        {resource.type.toUpperCase()}
                      </span>
                    </div>
                  );
                })()}
                
                <h3 className="text-sm font-bold text-gray-800 leading-tight mb-1 line-clamp-2">
                  {resource.title}
                </h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block font-medium">
                  {resource.module}
                </span>
                
                <p className="text-[11px] text-gray-500 mb-4 flex-1 line-clamp-3">
                  {resource.description}
                </p>

                <button 
                  onClick={() => resource.url && window.open(resource.url, '_blank')}
                  className="w-full mt-auto py-1.5 border border-accent text-accent text-[11px] font-bold rounded-lg hover:bg-accent hover:text-white transition-colors"
                >
                  Abrir Material
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DERECHA: Drag & Drop Dropzone */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
        
        {/* Dropzone */}
        <div className="bg-white border border-lab-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiUploadCloud className="text-gray-500 w-4 h-4" />
            <h3 className="font-bold text-gray-800 text-sm">Aportar a tu Biblioteca</h3>
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
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group ${
              isDragging ? 'border-accent bg-accent/5' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            <div className={`p-3 rounded-full mb-3 transition-colors ${isDragging ? 'bg-accent/10' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
              <FiUploadCloud className={`w-6 h-6 ${isDragging ? 'text-accent' : 'text-gray-500'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Arrastra archivos aquí</span>
            <span className="text-[11px] text-gray-500 mt-1">o haz clic para explorar</span>
            <span className="text-[10px] font-mono text-gray-400 mt-4 px-2 py-1 bg-gray-100 rounded">Soporta: PDF, DOCX, TXT</span>
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
        <div className="bg-white border border-lab-border rounded-xl p-5 shadow-sm flex-1 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 text-sm">Material Reciente</h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{localFiles.length}</span>
          </div>
          
          {localFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
              <FiFileText className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">Aún no has nutrido tu espacio de trabajo con PDFs.</p>
            </div>
          ) : (
            <ul className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
              {localFiles.map(f => (
                <li key={f.id} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="bg-white p-1.5 rounded border border-gray-200 shadow-sm shrink-0">
                    <FiFileText className="text-blue-600 w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-gray-700 truncate" title={f.name}>{f.name}</p>
                    <p className="text-[9px] font-mono text-gray-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

    </div>
  );
}
