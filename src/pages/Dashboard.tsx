import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projectMode } = useProject();

  return (
    <div className="h-full w-full overflow-y-auto bg-[#fbfbfb] p-8">
      
      {/* Header Resumen */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
          Hola, FC. Bienvenido a tu entorno.
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          {projectMode === 'solo' 
            ? 'Este es tu espacio personal. Aquí puedes ver alertas, documentación y avances sin distracciones de equipo.' 
            : 'Este es el resumen de tu proyecto de equipo. Mantente al día con los últimos documentos, logs y el agente IA.'}
        </p>
      </div>

      {/* Grid General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Atajo 1: IA / Laboratorio */}
        <div 
          onClick={() => navigate('/app/lab')}
          className="bg-white border border-lab-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start"
        >
          <div className="w-10 h-10 rounded bg-accent-light flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Ir al Laboratorio</h2>
          <p className="text-xs text-gray-500 mb-4">Abre tu IDE, inicia un chat con el agente IA y revisa tu terminal.</p>
          <span className="text-xs font-semibold text-accent mt-auto group-hover:underline">Abrir espacio &rarr;</span>
        </div>

        {/* Atajo 2: Documentos */}
        <div 
          onClick={() => navigate('/app/docs')}
          className="bg-white border border-lab-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start"
        >
          <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Documentos</h2>
          <p className="text-xs text-gray-500 mb-4">Publica un nuevo documento de investigación o revisa los subidos.</p>
          <span className="text-xs font-semibold text-blue-600 mt-auto group-hover:underline">Ver y crear docs &rarr;</span>
        </div>

        {/* Info Box: Estado */}
        <div className="bg-surface border border-lab-border rounded-xl p-5 shadow-sm flex flex-col">
          <h2 className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider mb-4 border-b border-lab-border pb-2">Resumen de Actividad</h2>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="text-xs">
                <span className="font-semibold text-gray-700">Sistema listo</span>
                <p className="text-gray-500 text-[10px] mt-0.5">Todos los servicios operando al 100%.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <div className="text-xs">
                <span className="font-semibold text-gray-700">1 Tarea pendiente</span>
                <p className="text-gray-500 text-[10px] mt-0.5">Revisar resultados en el Laboratorio.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
              <div className="text-xs">
                <span className="font-semibold text-gray-700">Actualización</span>
                <p className="text-gray-500 text-[10px] mt-0.5">Nuevo recurso añadido a Docs hace 2 hrs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
