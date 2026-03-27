import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { 
  FiUsers, 
  FiFolderPlus, 
  FiSearch, 
  FiArrowLeft, 
  FiArrowRight,
  FiFileText,
  FiUpload,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiDatabase,
  FiCpu,
  FiHexagon
} from 'react-icons/fi';

interface Project {
  id: number;
  name: string;
  owner: string;
  desc: string;
  status?: string;
  role?: string;
}

export default function Onboarding() {
  const navigate = useNavigate();

  useEffect(() => {
    const activeSession = sessionStorage.getItem('active_session');
    
    if (!activeSession) {
      localStorage.removeItem('sapientlab_user_id');
      localStorage.removeItem('sapientlab_user_name');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const [view, setView] = useState<'choice' | 'create' | 'join'>('choice');
  const [projects, setProjects] = useState<Project[]>([]);
  const [requestedProjects, setRequestedProjects] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sapientlab_requested_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  const [projectName, setProjectName] = useState('');
  const [projectDescInput, setProjectDescInput] = useState('');
  const [projectGoalInput, setProjectGoalInput] = useState('');
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { setProjectId, setProjectMode, setProjectName: setGlobalProjectName, setProjectGoal, setProjectDesc } = useProject();

  useEffect(() => {
    if (view === 'join') {
        const userId = localStorage.getItem('sapientlab_user_id') || '';
        
        if (!userId) {
          console.error('No user ID found');
          return;
        }
        
        fetch(`/api/projects?userId=${userId}`)
            .then(res => {
              if (!res.ok) throw new Error(`Error: ${res.status}`);
              return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProjects(data);
                } else {
                  console.warn('Unexpected data format:', data);
                  setProjects([]);
                }
            })
            .catch(err => {
              console.error('Error fetching projects:', err);
              setProjects([]);
            });
    }
  }, [view]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim() || !projectDescInput.trim() || !projectGoalInput.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const owner = localStorage.getItem('sapientlab_user_name') || 'Usuario Demo';
      
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectName, 
          projectDesc: projectDescInput, 
          workingOn: projectDescInput,
          goal: projectGoalInput,
          owner 
        })
      });
      
      if (!res.ok) {
        throw new Error(`Error al crear proyecto (${res.status})`);
      }

      const data = await res.json();
      
      if (!data?.project?.id) {
        throw new Error('El servidor no retornó un ID de proyecto válido');
      }

      const projectId = data.project.id;
      setProjectId(projectId);
      localStorage.setItem('sapientlab_project_id', projectId.toString());
      
      setProjectMode('solo');
      setGlobalProjectName(projectName);
      setProjectDesc(projectDescInput);
      setProjectGoal(projectGoalInput);

      if (projectFiles.length > 0) {
        const recentFiles = projectFiles.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size
        }));
        
        const storageKey = `sapientlab_recent_files_project_${projectId}`;
        const savedFiles = localStorage.getItem(storageKey);
        const existingFiles = savedFiles ? JSON.parse(savedFiles) : [];
        const allFiles = [...existingFiles, ...recentFiles];
        const limitedFiles = allFiles.slice(-20);
        localStorage.setItem(storageKey, JSON.stringify(limitedFiles));
        
        try {
          const { aiService } = await import('../services/aiService');
          await aiService.uploadProjectDocuments(projectFiles, projectId.toString());
        } catch (docError) {
          console.warn('Advertencia:', docError);
        }
      }

      setProjectName('');
      setProjectDescInput('');
      setProjectGoalInput('');
      setProjectFiles([]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/app');
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleJoinProject = async (projectId: number) => {
    try {
        const userId = Number(localStorage.getItem('sapientlab_user_id')) || 1;
        
        if (!userId) {
          alert('Error: No se pudo obtener el ID de usuario');
          return;
        }
        
        const res = await fetch(`/api/projects/${projectId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        if (!res.ok) {
          throw new Error(`Error al enviar solicitud (${res.status})`);
        }
        
        const newRequested = [...requestedProjects, projectId];
        setRequestedProjects(newRequested);
        localStorage.setItem('sapientlab_requested_projects', JSON.stringify(newRequested));
        
        alert('Solicitud enviada. Esperando aprobación del administrador.');
    } catch (e) {
        console.error('Error:', e);
        alert(`Error al enviar la solicitud: ${e instanceof Error ? e.message : 'Error desconocido'}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      setProjectFiles(files);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020] flex items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute inset-0 bg-[#0a0f1c]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.15),transparent_40%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.12),transparent_40%)]" />
    <div className="absolute inset-0 bg-scientific-grid opacity-20" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />
    </div>
    <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_50%,rgba(56,189,248,0.08),transparent_60%)]" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
      
      <div className="w-full max-w-5xl relative z-10">
        
        {/* Vista 1: Elegir camino - Estilo científico oscuro */}
        {view === 'choice' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center relative">
                <div className="absolute inset-0 bg-accent blur-2xl opacity-30 rounded-full" />
                <div className="relative bg-gradient-to-br from-accent to-accent-dim p-4 rounded-2xl shadow-[0_0_30px_rgba(17,67,112,0.3)]">
                  <FiHexagon className="w-10 h-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold 
bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 
bg-clip-text text-transparent tracking-tight leading-normal">
  Laboratorio Digital
</h1>
              
              <p className="text-slate-400 text-lg max-w-2xl mx-auto font-mono">
                Inicializa tu entorno de investigación asistida por IA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Opción Solo - Estilo científico */}
              <div 
                onClick={() => setView('create')}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500" />
                <div className="relative bg-[#0f1624]/80 backdrop-blur-md border border-accent/20 rounded-2xl p-8 hover:border-accent/60 transition-all duration-300 hover:-translate-y-2 shadow-xl">
                  <div className="absolute top-4 right-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <div className="bg-gradient-to-br from-accent to-blue-700 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <FiCpu className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-3">Investigación Individual</h3>
                  <p className="text-slate-400 leading-relaxed mb-6 font-mono text-sm">
                    Configura tu asistente personal de investigación. Análisis de datos, generación de hipótesis y documentación automatizada.
                  </p>
                  <div className="flex items-center gap-2 text-accent font-mono text-sm group-hover:gap-3 transition-all">
                    <span>INICIAR SESIÓN CIENTÍFICA</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Opción Equipo - Estilo colaborativo */}
              <div 
                onClick={() => setView('join')}
                className="group relative cursor-pointer"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500" />
                <div className="relative bg-[#0f1624]/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-8 hover:border-cyan-500/60 transition-all duration-300 hover:-translate-y-2 shadow-xl">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <FiUsers className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-100 mb-3">Colaboración Científica</h3>
                  <p className="text-slate-400 leading-relaxed mb-6 font-mono text-sm">
                    Únete a equipos de investigación multidisciplinarios. Comparte hallazgos, valida resultados y acelera descubrimientos.
                  </p>
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm group-hover:gap-3 transition-all">
                    <span>EXPLORAR LABORATORIOS</span>
                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* Indicador de seguridad */}
            <div className="flex justify-center gap-6 pt-8">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <FiShield className="w-3 h-3" />
                <span>Encriptación end-to-end</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <FiDatabase className="w-3 h-3" />
                <span>Respaldo automático</span>
              </div>
            </div>
          </div>
        )}

        {/* Vista 2: Crear proyecto - Estilo científico */}
        {view === 'create' && (
          <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="absolute -inset-4 bg-gradient-to-r from-accent/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl" />
            <div className="relative bg-[#0f1624]/90 backdrop-blur-xl border border-accent/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-accent/20">
                <button 
                  onClick={() => setView('choice')}
                  disabled={isUploading}
                  className="p-2 hover:bg-accent/10 rounded-lg transition-all disabled:opacity-50"
                >
                  <FiArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                    Nueva Investigación
                  </h2>
                  <p className="text-slate-500 text-sm font-mono mt-1">Configuración del entorno experimental</p>
                </div>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-2">
                    CÓDIGO DEL PROYECTO
                  </label>
                  <input 
                    type="text" 
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0f1c] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono text-slate-200 placeholder:text-slate-600 transition-all"
                    placeholder="PROY-001 / Evaluación antimicrobiana"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-2">
                    HIPÓTESIS Y METODOLOGÍA
                  </label>
                  <textarea 
                    required
                    rows={4}
                    value={projectDescInput}
                    onChange={(e) => setProjectDescInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0f1c] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all resize-none"
                    placeholder="Describir hipótesis, variables críticas, criterios de éxito y riesgos experimentales..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-2">
                    OBJETIVOS CIENTÍFICOS
                  </label>
                  <textarea 
                    required
                    rows={2}
                    value={projectGoalInput}
                    onChange={(e) => setProjectGoalInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0f1c] border border-accent/20 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-mono text-sm text-slate-200 placeholder:text-slate-600 transition-all resize-none"
                    placeholder="Ej. Determinar la concentración inhibitoria mínima (CIM) para cepas resistentes..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-accent uppercase tracking-wider mb-2">
                    DOCUMENTACIÓN BASE
                  </label>
                  <div 
                    className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
                      dragActive 
                        ? 'border-accent bg-accent/10' 
                        : 'border-accent/30 bg-[#0a0f1c] hover:border-accent/60'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.csv,.jpg,.jpeg,.png,.gif,.zip,.tar,.gz"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          setProjectFiles(files);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <FiUpload className="w-10 h-10 text-accent/60 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 font-mono">
                        Arrastrar archivos o <span className="text-accent">seleccionar</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-2 font-mono">
                        PDF, DOC, TXT, CSV, imágenes, código fuente
                      </p>
                    </div>
                  </div>
                  
                  {projectFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {projectFiles.slice(0, 4).map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-accent/5 p-2 rounded-lg border border-accent/20">
                          <FiFileText className="w-3 h-3 text-accent" />
                          <span>{file.name}</span>
                          <span className="text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                      {projectFiles.length > 4 && (
                        <p className="text-xs text-slate-500 font-mono">+{projectFiles.length - 4} archivos más</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    disabled={isUploading}
                    className="flex-1 bg-gradient-to-r from-accent to-blue-700 text-white font-mono font-semibold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(17,67,112,0.5)] transition-all duration-300 disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        INICIALIZANDO...
                      </>
                    ) : (
                      <>
                        INICIAR INVESTIGACIÓN
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vista 3: Unirse a proyecto - Estilo colaborativo científico */}
        {view === 'join' && (
          <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 rounded-3xl blur-3xl" />
            <div className="relative bg-[#0f1624]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-cyan-500/20">
                <button 
                  onClick={() => setView('choice')}
                  className="p-2 hover:bg-cyan-500/10 rounded-lg transition-all"
                >
                  <FiArrowLeft className="w-5 h-5 text-slate-400" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Red de Investigación
                  </h2>
                  <p className="text-slate-500 text-sm font-mono mt-1">Colaboración científica global</p>
                </div>
              </div>

              <div className="relative mb-6">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-500/60 w-4 h-4" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0a0f1c] border border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-slate-200 placeholder:text-slate-600"
                  placeholder="Buscar por proyecto, investigador o institución..."
                />
              </div>
              
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-12">
                    <FiFolderPlus className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
                    <p className="text-slate-500 font-mono">No se encontraron laboratorios activos</p>
                  </div>
                ) : (
                  filteredProjects.map(project => (
                    <div 
                      key={`project-${project.id}`}
                      className="group p-5 bg-[#0a0f1c]/50 border border-cyan-500/20 rounded-xl hover:border-cyan-500/50 hover:bg-[#0a0f1c] transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-slate-100 text-lg font-mono">{project.name}</h4>
                            {project.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-mono border border-emerald-500/30">
                                <FiCheckCircle className="w-3 h-3" />
                                ACTIVO
                              </span>
                            )}
                            {(project.status === 'requested' || requestedProjects.includes(project.id)) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-mono border border-amber-500/30">
                                <FiClock className="w-3 h-3" />
                                PENDIENTE
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-cyan-400/80 mb-2">
                            PI: {project.owner}
                          </p>
                          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 font-mono">
                            {project.desc}
                          </p>
                        </div>
                        
                        {project.status === 'active' ? (
                          <button 
                            type="button"
                            onClick={() => {
                              localStorage.setItem('sapientlab_project_id', project.id.toString());
                              setProjectId(project.id);
                              setGlobalProjectName(project.name);
                              setProjectDesc(project.desc || '');
                              setProjectMode('team');
                              navigate('/app');
                            }}
                            className="whitespace-nowrap px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-mono text-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                          >
                            ACCEDER
                          </button>
                        ) : project.status === 'requested' || requestedProjects.includes(project.id) ? (
                          <button 
                            disabled
                            className="whitespace-nowrap px-5 py-2 border border-amber-500/50 text-amber-400 bg-amber-500/10 rounded-lg font-mono text-sm cursor-not-allowed"
                          >
                            SOLICITUD ENVIADA
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleJoinProject(project.id)}
                            className="whitespace-nowrap px-5 py-2 border-2 border-cyan-500 text-cyan-400 rounded-lg font-mono text-sm hover:bg-cyan-500 hover:text-white transition-all"
                          >
                            SOLICITAR ACCESO
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <FiShield className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <p className="text-xs text-cyan-300/70 leading-relaxed font-mono">
                    Los laboratorios verifican las solicitudes de acceso. Una vez aprobado, podrás contribuir con datos, 
                    acceder a la documentación y participar en discusiones científicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}