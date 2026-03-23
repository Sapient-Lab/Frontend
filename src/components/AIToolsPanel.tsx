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
  '/app/dashboard': [
    {
      name: 'Azure Agent',
      icon: <FiCpu className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-100',
      description: 'Auto-análisis y generación de insights',
    },
  ],
  '/app/protocol-scanner': [
    {
      name: 'Azure Vision',
      icon: <FiEye className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100',
      description: 'Análisis de imágenes de protocolos',
    },
    {
      name: 'Azure Speech STT',
      icon: <FiMic className="w-4 h-4" />,
      color: 'text-green-600 bg-green-100',
      description: 'Dictado de voz a texto',
    },
  ],
  '/app/data-analysis': [
    {
      name: 'Document Intelligence',
      icon: <FiFileText className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-100',
      description: 'Extracción de datos en PDF/Excel',
    },
    {
      name: 'Azure Foundry',
      icon: <FiZap className="w-4 h-4" />,
      color: 'text-yellow-600 bg-yellow-100',
      description: 'GPT-4o para análisis de datos',
    },
  ],
  '/app/lab-workspace': [
    {
      name: 'Azure Speech TTS',
      icon: <FiVolume2 className="w-4 h-4" />,
      color: 'text-cyan-600 bg-cyan-100',
      description: 'Lectura en voz alta del código',
    },
    {
      name: 'Copilot Explain',
      icon: <FiCpu className="w-4 h-4" />,
      color: 'text-indigo-600 bg-indigo-100',
      description: 'Explicación de código con IA',
    },
  ],
  '/app/chat-agent': [
    {
      name: 'Azure GPT-4o',
      icon: <FiZap className="w-4 h-4" />,
      color: 'text-blue-600 bg-blue-100',
      description: 'Asistente conversacional principal',
    },
    {
      name: 'Mistral AI',
      icon: <FiZap className="w-4 h-4" />,
      color: 'text-orange-600 bg-orange-100',
      description: 'Modelo alternativo (seleccionable)',
    },
    {
      name: 'DeepSeek',
      icon: <FiZap className="w-4 h-4" />,
      color: 'text-purple-600 bg-purple-100',
      description: 'Modelo alternativo (seleccionable)',
    },
  ],
};

export default function AIToolsPanel() {
  const location = useLocation();
  const currentPath = location.pathname;
  const tools = pageToolsMap[currentPath] || [];

  if (tools.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-0 top-20 w-72 h-max bg-white border-l border-lab-border shadow-lg rounded-l-lg p-4 max-h-[calc(100vh-100px)] overflow-y-auto z-40">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-lab-border">
        <FiSliders className="w-5 h-5 text-accent" />
        <h3 className="text-sm font-bold text-gray-800">Herramientas IA</h3>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        {tools.map((tool, idx) => (
          <div key={idx} className={`p-3 rounded-lg border border-gray-200 ${tool.color} bg-opacity-20`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 p-2 rounded ${tool.color} flex-shrink-0`}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{tool.name}</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">{tool.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-lab-border">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          💡 Estas herramientas IA están activas en esta sección. Puedes usar sus funcionalidades en los elementos interactivos.
        </p>
      </div>
    </div>
  );
}
