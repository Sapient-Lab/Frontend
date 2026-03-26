import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

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
    if (!sessionStorage.getItem('active_session')) {
      localStorage.removeItem('sapientlab_user_id');
      localStorage.removeItem('sapientlab_user_name');
      localStorage.removeItem('user');
      navigate('/login');
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
  
  // States para crear
  const [projectName, setProjectName] = useState('');
  const [projectDescInput, setProjectDescInput] = useState('');
  const [projectGoalInput, setProjectGoalInput] = useState('');
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // State para buscar
  const [searchTerm, setSearchTerm] = useState('');
  
  const { setProjectId, setProjectMode, setProjectName: setGlobalProjectName, setProjectGoal, setProjectDesc } = useProject();

  useEffect(() => {
    if (view === 'join') {
        fetch(`/api/projects?userId=${localStorage.getItem('sapientlab_user_id') || ''}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setProjects(data);
                }
            })
            .catch(err => console.error('Error fetching projects:', err));
    }
  }, [view]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    console.log('📝 Inicio de handleCreateProject. Archivos a subir:', projectFiles.length, projectFiles);

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

      // Si hay archivos, enviarlos al Backend Y guardar en Material Reciente
      if (projectFiles.length > 0) {
        // Agregar archivos a Material Reciente PRIMERO (antes de async operations)
        const recentFiles = projectFiles.map(file => ({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size
        }));
        
        // Usar clave específica del proyecto para filtrar correctamente
        const storageKey = `sapientlab_recent_files_project_${projectId}`;
        const savedFiles = localStorage.getItem(storageKey);
        const existingFiles = savedFiles ? JSON.parse(savedFiles) : [];
        const allFiles = [...existingFiles, ...recentFiles];
        // Limitar a los últimos 20 archivos
        const limitedFiles = allFiles.slice(-20);
        localStorage.setItem(storageKey, JSON.stringify(limitedFiles));
        
        // Verificar que se guardó correctamente
        const verifyedFiles = localStorage.getItem(storageKey);
        console.log('✅ Documentos guardados en Material Reciente para proyecto', projectId, ':', limitedFiles);
        console.log('🔍 Verificación de localStorage:', verifyedFiles);
        
        // Ahora enviar al Backend (puede fallar sin afectar lo guardado)
        try {
          const { aiService } = await import('../services/aiService');
          await aiService.uploadProjectDocuments(projectFiles, projectId.toString());
          console.log('✅ Documentos subidos al backend');
        } catch (docError) {
          console.warn('Advertencia: Los documentos no se pudieron subir al backend, pero se guardaron localmente:', docError);
        }
      }

      // Asegurar que localStorage se write antes de navigate
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/app');
    } catch (error) {
      console.error('Error al procesar el proyecto:', error);
      alert(`Hubo un problema al crear el proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleJoinProject = async (projectId: number) => {
    console.log('Solicitud enviada al proyecto id:', projectId);
    try {
        const userId = Number(localStorage.getItem('sapientlab_user_id')) || 1;
        await fetch(`/api/projects/${projectId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        
        // Save to local storage to remember pending state
        const newRequested = [...requestedProjects, projectId];
        setRequestedProjects(newRequested);
        localStorage.setItem('sapientlab_requested_projects', JSON.stringify(newRequested));
        
        alert('¡Tu solicitud ha sido enviada con éxito! Has quedado en estado PENDIENTE. No puedes acceder hasta que el administrador te apruebe.');
    } catch (e) {
        console.error('Error al solicitar unirse', e);
        alert('Hubo un problema al enviar la solicitud.');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-lab-bg p-4 flex-col">
      <div className="w-full max-w-2xl bg-surface p-8 rounded-lg shadow-sm border border-lab-border transition-all duration-300">
        
        {/* Cabecera general */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center mb-4 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="4" width="5" height="5" rx="1" fill="white" opacity="0.9"/>
              <rect x="9" y="4" width="5" height="5" rx="1" fill="white" opacity="0.6"/>
              <rect x="2" y="11" width="5" height="2" rx="1" fill="white" opacity="0.6"/>
              <rect x="9" y="11" width="5" height="2" rx="1" fill="white" opacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-mono font-bold text-accent">Configura tu espacio</h1>
          <p className="text-sm text-muted mt-2">
            {view === 'choice' && 'Selecciona cómo quieres iniciar tu cuaderno de laboratorio.'}
            {view === 'create' && 'Crea un entorno con objetivos, riesgos y criterios de validación.'}
            {view === 'join' && 'Únete a un estudio activo y contribuye con evidencia verificable.'}
          </p>
        </div>

        {/* Vista 1: Elegir camino */}
        {view === 'choice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <button 
              onClick={() => setView('create')}
              className="p-6 border-2 border-lab-border rounded-lg hover:border-accent hover:bg-accent-light transition-all flex flex-col items-center text-center group cursor-pointer h-full"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-full mb-4 flex items-center justify-center group-hover:bg-accent text-accent group-hover:text-white transition-colors duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Solo para mí</h3>
              <p className="text-sm text-muted">Configuraré un protocolo propio con métricas y decisiones bajo mi supervisión.</p>
            </button>

            <button 
              onClick={() => setView('join')}
              className="p-6 border-2 border-lab-border rounded-lg hover:border-accent hover:bg-accent-light transition-all flex flex-col items-center text-center group cursor-pointer h-full"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-full mb-4 flex items-center justify-center group-hover:bg-accent text-accent group-hover:text-white transition-colors duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Unirme a proyecto</h3>
              <p className="text-sm text-muted">Me integraré a un equipo activo para documentar y contrastar resultados.</p>
            </button>
          </div>
        )}

        {/* Vista 2: Crear proyecto */}
        {view === 'create' && (
          <form onSubmit={handleCreateProject} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
              <input 
                type="text" 
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2.5 border border-lab-border rounded focus:outline-none focus:border-accent font-sans bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ej. Evaluación de sensibilidad antimicrobiana"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿En qué está trabajando? (Descripción)</label>
              <textarea 
                required
                rows={4}
                value={projectDescInput}
                onChange={(e) => setProjectDescInput(e.target.value)}
                className="w-full px-4 py-2.5 border border-lab-border rounded focus:outline-none focus:border-accent font-sans bg-gray-50 focus:bg-white transition-colors resize-none"
                placeholder="Describe hipótesis, criterios de éxito, riesgos y variables críticas..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué está tratando de lograr? (Objetivo)</label>
              <textarea 
                required
                rows={2}
                value={projectGoalInput}
                onChange={(e) => setProjectGoalInput(e.target.value)}
                className="w-full px-4 py-2 border border-lab-border rounded focus:outline-none focus:border-accent font-sans bg-gray-50 focus:bg-white transition-colors resize-none"
                placeholder="Ej. Crear un prototipo rápido de la base de datos..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Documentos base (opcional)</label>
              <input 
                type="file" 
                multiple
                onChange={(e) => setProjectFiles(Array.from(e.target.files || []))}
                className="w-full px-3 py-2 border border-lab-border rounded text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-accent file:text-white hover:file:bg-accent-dim transition-colors"
              />
              <p className="text-xs text-muted mt-1">Sube archivos que la IA pueda leer (PDFs, TXT, código, etc) para agregarlos a la memoria del proyecto.</p>
            </div>
            
            <div className="flex gap-3 pt-3 border-t border-lab-border">
              <button 
                type="button" 
                onClick={() => setView('choice')}
                disabled={isUploading}
                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button 
                type="submit" 
                disabled={isUploading}
                className="flex-1 bg-accent text-white font-mono py-2 rounded hover:bg-accent-dim transition-colors disabled:opacity-75 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    PROCESANDO...
                  </>
                ) : 'CREAR PROYECTO'}
              </button>
            </div>
          </form>
        )}

        {/* Vista 3: Unirme a proyecto */}
        {view === 'join' && (
          <div className="flex flex-col h-full animate-in fade-in">
            <div className="mb-4">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 border border-lab-border rounded-full focus:outline-none focus:border-accent font-sans text-sm bg-gray-50 focus:bg-white"
                placeholder="Buscar por nombre de proyecto o equipo..."
              />
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProjects.length === 0 ? (
                <p className="text-center text-muted py-8 italic text-sm">No se encontraron proyectos.</p>
              ) : (
                filteredProjects.map(project => (
                  <div key={project.id} className="p-4 border border-lab-border flex items-center justify-between rounded hover:border-accent group transition-all bg-white hover:shadow-sm">
                    <div className="flex-1 pr-4">
                      <h4 className="font-semibold text-gray-800 text-[15px]">{project.name}</h4>
                      <p className="text-[11px] font-mono text-accent mb-1.5">Lead: {project.owner}</p>
                      <p className="text-xs text-muted leading-relaxed line-clamp-2">{project.desc}</p>
                    </div>
                    {project.status === 'active' ? (
                      <button 
                         onClick={() => {
                           localStorage.setItem('sapientlab_project_id', project.id.toString());
                           setProjectId(project.id);
                           setGlobalProjectName(project.name);
                           setProjectDesc(project.desc || '');
                           setProjectMode('team');
                           navigate('/app');
                         }}
                         className="whitespace-nowrap px-4 py-1.5 border border-green-500 text-green-600 bg-green-50 rounded text-sm font-medium hover:bg-green-100 transition-colors">
                        Entrar
                      </button>
                    ) : project.status === 'requested' || requestedProjects.includes(project.id) ? (
                      <button 
                        disabled
                        className="whitespace-nowrap px-4 py-1.5 border border-amber-500 text-amber-600 bg-amber-50 rounded text-sm font-medium opacity-80 cursor-not-allowed">
                        Pendiente
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleJoinProject(project.id)}
                        className="whitespace-nowrap px-4 py-1.5 border border-accent text-accent rounded text-sm font-medium hover:bg-accent hover:text-white transition-colors">
                        Solicitar
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-lab-border">
              <button 
                type="button" 
                onClick={() => setView('choice')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Volver a opciones
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}