import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

const mockProjects = [
  { id: 1, name: 'Proyecto Alpha', owner: 'Equipo Rojo', desc: 'Desarrollo de microservicios con Spring Boot y base de datos relacional.' },
  { id: 2, name: 'Sistema de Gestión', owner: 'Equipo Azul', desc: 'Plataforma administrativa creada en React y Node.js.' },
  { id: 3, name: 'E-commerce API', owner: 'Ana Gómez', desc: 'Migración de un monolito a una arquitectura serverless en AWS.' },
  { id: 4, name: 'App de Salud', owner: 'BioTech S.A.', desc: 'Aplicación móvil para el seguimiento de pacientes crónicos.' },
];

export default function Onboarding() {
  const [view, setView] = useState<'choice' | 'create' | 'join'>('choice');
  
  // States para crear
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  
  // State para buscar
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const { setProjectMode } = useProject();

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Proyecto creado:', { projectName, projectDesc });
    setProjectMode('solo');
    // TODO: Llamada a la API para crear proyecto
    navigate('/app');
  };

  const handleJoinProject = (projectId: number) => {
    console.log('Solicitud enviada al proyecto id:', projectId);
    alert('¡Tu solicitud ha sido enviada con éxito! Serás notificado cuando sea aprobada.');
    setProjectMode('team');
    // TODO: Llamada a la API para solicitar unirse
    navigate('/app');
  };

  const filteredProjects = mockProjects.filter((p) =>
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
            {view === 'choice' && '¿Cómo te gustaría empezar a trabajar?'}
            {view === 'create' && 'Crea tu propio proyecto para iniciar'}
            {view === 'join' && 'Explora proyectos abiertos y colabora'}
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
              <p className="text-sm text-muted">Quiero configurar un nuevo proyecto desde cero y ser el líder del equipo.</p>
            </button>

            <button 
              onClick={() => setView('join')}
              className="p-6 border-2 border-lab-border rounded-lg hover:border-accent hover:bg-accent-light transition-all flex flex-col items-center text-center group cursor-pointer h-full"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-full mb-4 flex items-center justify-center group-hover:bg-accent text-accent group-hover:text-white transition-colors duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Unirme a proyecto</h3>
              <p className="text-sm text-muted">Quiero unirme a un equipo existente y aportar mis conocimientos.</p>
            </button>
          </div>
        )}

        {/* Vista 2: Crear proyecto */}
        {view === 'create' && (
          <form onSubmit={handleCreateProject} className="space-y-5 animate-in fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto</label>
              <input 
                type="text" 
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-2.5 border border-lab-border rounded focus:outline-none focus:border-accent font-sans bg-gray-50 focus:bg-white transition-colors"
                placeholder="Ej. Sistema de Inventario IA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción corta</label>
              <textarea 
                required
                rows={4}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full px-4 py-2.5 border border-lab-border rounded focus:outline-none focus:border-accent font-sans bg-gray-50 focus:bg-white transition-colors resize-none"
                placeholder="Describe brevemente los objetivos y tecnologías de tu laboratorio..."
              />
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-lab-border">
              <button 
                type="button" 
                onClick={() => setView('choice')}
                className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded transition-colors"
              >
                Volver
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-accent text-white font-mono py-2 rounded hover:bg-accent-dim transition-colors"
              >
                CREAR PROYECTO
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
                placeholder="🔍 Buscar por nombre de proyecto o equipo..."
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
                    <button 
                      onClick={() => handleJoinProject(project.id)}
                      className="whitespace-nowrap px-4 py-1.5 border border-accent text-accent rounded text-sm font-medium hover:bg-accent hover:text-white transition-colors"
                    >
                      Solicitar
                    </button>
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