import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projectMode } = useProject();

  const recentActivity = projectMode === 'team' ? [
    { id: 1, time: 'Hace 10 min', text: 'Dr. A. Gómez subió un nuevo recurso a la guía.', user: 'AG', color: 'bg-blue-500' },
    { id: 2, time: 'Hace 2 hrs', text: 'Elena R. resolvió 3 warnings en el microservicio.', user: 'ER', color: 'bg-green-500' },
    { id: 3, time: 'Ayer', text: 'Tú completaste la "Introducción".', user: 'FC', color: 'bg-accent' },
  ] : [
    { id: 1, time: 'Hace 10 min', text: 'Iniciaste el entorno de pruebas local.', user: 'FC', color: 'bg-accent' },
    { id: 2, time: 'Hace 2 hrs', text: 'Guardaste 2 archivos nuevos en Documentos.', user: 'FC', color: 'bg-accent' },
    { id: 3, time: 'Ayer', text: 'Completaste la "Introducción".', user: 'FC', color: 'bg-accent' },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-[#fbfbfb] p-8 lg:p-10">
      
      {/* Header Resumen */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
          Hola, FC. Bienvenido a tu entorno.
        </h1>
        <p className="text-sm text-gray-500 max-w-2xl">
          {projectMode === 'solo' 
            ? 'Este es tu espacio personal. Aquí puedes ver tu progreso, recomendaciones del agente y tus métricas.' 
            : 'Este es el resumen de tu proyecto de equipo. Mantente al día con los avances y las notas de tu grupo.'}
        </p>
      </div>

      {/* Grid General */}
      <div className="flex flex-col gap-6">

        {/* Fila 1: Progreso + Insights IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta de Progreso del Curso */}
          <div className="lg:col-span-2 bg-white border border-lab-border rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            {/* Efecto de fondo sutil */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl"></div>
            
            <div className="z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider mb-1 block">Módulo Actual Activo</span>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">API REST con Spring</h2>
                  <p className="text-sm text-gray-500">Módulo 3 de 7 • Setup del entorno completado</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-accent">28%</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Completado</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6">
                <div className="bg-accent h-2.5 rounded-full relative" style={{width: '28%'}}>
                  <div className="absolute -right-1.5 -top-1 w-4 h-4 bg-white border-2 border-accent rounded-full shadow"></div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/app/lab')}
                  className="bg-accent text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-accent-dim transition-colors shadow-sm"
                >
                  Continuar en el Laboratorio
                </button>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  2 Tareas pendientes
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Insights de IA */}
          <div className="bg-[#F8FAFC] border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-accent rounded-t-xl"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">💡</div>
              <h2 className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">Insight del Agente IA</h2>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed z-10 flex-1">
              "He notado que en tu última sesión tuvimos errores de conexión a la base de datos tipo <code className="text-xs bg-white px-1 py-0.5 rounded text-red-500 border border-red-100 inline-block mt-0.5">ConnectionRefused</code>. Te sugiero revisar el archivo <code className="text-xs bg-white px-1 py-0.5 rounded text-gray-600 border border-gray-200">application.properties</code> para la próxima vez que entres."
            </p>
            
            <button 
              onClick={() => navigate('/app/lab')}
              className="mt-4 text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1 group"
            >
              Abrir chat con IA para resolverlo <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Accesos Directos + Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Accesos Directos */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            {/* Atajo 1: Protocolos */}
            <div 
              onClick={() => navigate('/app/protocolos')}
              className="bg-white border border-lab-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start"
            >
              <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Escáner de Seguridad</h2>
              <p className="text-xs text-gray-500 mb-4">Revisa la teoría del módulo y pasa tus apuntes por la IA para detectar riesgos biológicos.</p>
              <span className="text-xs font-semibold text-green-600 mt-auto group-hover:underline">Abrir escáner &rarr;</span>
            </div>

            {/* Atajo 2: Tareas */}
            <div 
              onClick={() => navigate('/app/tareas')}
              className="bg-white border border-lab-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start"
            >
              <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Centro de Tareas</h2>
              <p className="text-xs text-gray-500 mb-4">Tienes 2 entregas pendientes para subir a Vercel. Ve la rúbrica aquí.</p>
              <span className="text-xs font-semibold text-orange-500 mt-auto group-hover:underline">Ver entregas pendientes &rarr;</span>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-surface border border-lab-border rounded-xl p-6 shadow-sm flex flex-col">
            <h2 className="text-[10px] font-mono font-bold text-muted uppercase tracking-wider mb-5 border-b border-lab-border pb-2">
              {projectMode === 'solo' ? 'Tu Bitácora Reciente' : 'Actividad del Equipo'}
            </h2>
            
            <div className="flex-1 space-y-5">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-4 relative">
                  {/* Linea conectora de timeline si no es el último */}
                  {index !== recentActivity.length - 1 && (
                    <div className="absolute left-3.5 top-8 w-[1px] h-[calc(100%+4px)] bg-lab-border"></div>
                  )}
                  
                  <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-bold text-white z-10 ${activity.color}`}>
                    {activity.user}
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 leading-tight mb-1">{activity.text}</p>
                    <span className="text-[10px] text-gray-400 font-mono">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full text-center mt-6 text-xs font-medium text-gray-500 hover:text-accent transition-colors">
              Ver todo el historial
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
