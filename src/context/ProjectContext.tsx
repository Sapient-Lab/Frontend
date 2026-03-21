import { createContext, useContext, useState, type ReactNode } from 'react';

type ProjectMode = 'solo' | 'team';

interface ProjectContextType {
  projectMode: ProjectMode;
  setProjectMode: (mode: ProjectMode) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  // Inicializamos el estado leyendo el localStorage
  const [projectMode, setProjectModeState] = useState<ProjectMode>(() => {
    try {
      const savedMode = localStorage.getItem('sapientlab_mode');
      if (savedMode === 'solo' || savedMode === 'team') {
        return savedMode;
      }
    } catch (e) {
      console.warn('No se pudo leer localStorage', e);
    }
    return 'solo';
  });

  // Cada vez que cambie, lo guardamos en localStorage
  const setProjectMode = (mode: ProjectMode) => {
    try {
      localStorage.setItem('sapientlab_mode', mode);
    } catch (e) {
      console.warn('No se pudo escribir en localStorage', e);
    }
    setProjectModeState(mode);
  };

  return (
    <ProjectContext.Provider value={{ projectMode, setProjectMode }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject debe usarse dentro de un ProjectProvider');
  }
  return context;
}
