import { createContext, useContext, useState, ReactNode } from 'react';

type ProjectMode = 'solo' | 'team';

interface ProjectContextType {
  projectMode: ProjectMode;
  setProjectMode: (mode: ProjectMode) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectMode, setProjectMode] = useState<ProjectMode>('solo');

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
