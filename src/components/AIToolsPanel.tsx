import { useLocation } from 'react-router-dom';
import { FiSliders } from 'react-icons/fi';
import {
  FiEye,
  FiVolume2,
  FiFileText,
  FiZap,
  FiCpu,
  FiMic,
} from 'react-icons/fi';

interface Tool {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface PageTools {
  [key: string]: Tool[];
}

const pageToolsMap: PageTools = {
  '/app/dashboard': [],
  '/app/protocol-scanner': [],
  '/app/data-analysis': [],
  '/app/lab-workspace': [],
  '/app/chat-agent': [],
  '/app/intelligent-lab-notebook': [],
};

export default function AIToolsPanel() {
  const location = useLocation();
  const currentPath = location.pathname;
  const tools = pageToolsMap[currentPath];

  // Solo oculta si la ruta no está en el mapa
  if (tools === undefined) {
    return null;
  }

  return (
    <div className="fixed right-0 top-20 w-72 h-max bg-white border-l border-lab-border shadow-lg rounded-l-lg p-4 max-h-[calc(100vh-100px)] overflow-y-auto z-40">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-lab-border">
        <FiSliders className="w-5 h-5 text-accent" />
        <h3 className="text-sm font-bold text-gray-800">Herramientas IA</h3>
      </div>

      {/* Panel Vacío */}
      <div className="space-y-3">
        {/* Contenido eliminado */}
      </div>
    </div>
  );
}
