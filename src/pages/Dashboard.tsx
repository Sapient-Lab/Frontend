import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiZap } from 'react-icons/fi';
import { useProject } from '../context/ProjectContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projectMode, projectId } = useProject();

  const [aiMessage, setAiMessage] = useState(
    'Análisis pendiente: carga un protocolo o evidencia para generar recomendaciones de seguridad.'
  );
  const [recentActivity, setRecentActivity] = useState<Array<{ id: string | number; time: string; text: string; user: string; color: string }>>(
    []
  );

  const palette = useMemo(
    () => ['bg-blue-500', 'bg-green-500', 'bg-accent', 'bg-purple-500', 'bg-amber-500'],
    []
  );

  const relativeTime = (isoDate: string) => {
    const target = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - target);
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hrs`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Ayer' : `Hace ${days} días`;
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      let hasActivity = false;
      try {
        const progressPromise = fetch('/api/platform/users/me/progress');
        const logsPromise = projectId
          ? fetch(`/api/platform/projects/${projectId}/logs`)
          : null;

        const [progressRes, logsRes] = await Promise.all([progressPromise, logsPromise]);

        if (progressRes.ok) {
          const progress = await progressRes.json();
          if (active && progress?.recentActivity?.length) {
            setAiMessage(progress.recentActivity[0].text);
          }
        }

        if (logsRes && logsRes.ok) {
          const logs = await logsRes.json();
          if (active && Array.isArray(logs)) {
            const mapped = logs.slice(0, 6).map((log: any, idx: number) => {
              const initials = (log.author || 'Equipo').substring(0, 2).toUpperCase();
              const color = palette[idx % palette.length];
              return {
                id: log.id,
                time: log.createdAt ? relativeTime(log.createdAt) : 'Hace un momento',
                text: log.message,
                user: initials,
                color,
              };
            });
            setRecentActivity(mapped);
            hasActivity = mapped.length > 0;
          }
        }

        // Fallback if no activity yet
        if (active && !hasActivity) {
          setRecentActivity([
            { id: 'fallback-1', time: 'Hace 10 min', text: 'Carga tus primeros logs para ver actividad aquí.', user: 'AI', color: 'bg-blue-500' },
          ]);
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard', error);
      }
    };

    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, projectMode]);

  return (
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 page-fade-in">
      
      {/* Header Resumen */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#152536] tracking-tight mb-2">
          Centro de Operaciones Científicas
        </h1>
        <p className="text-sm text-gray-600 max-w-3xl leading-relaxed">
          {projectMode === 'solo' 
            ? 'Asistente de cuaderno para razonar experimentos sin reemplazar el juicio científico. Aquí verás progreso, alertas y recomendaciones explicables.'
            : 'Resumen colaborativo del proyecto. Prioriza trazabilidad, decisiones justificadas y límites de seguridad en cada iteración.'}
        </p>
      </div>

      <div className="mb-6 p-4 rounded-xl border border-[#d8e1ec] bg-white/80 backdrop-blur stagger-in">
        <p className="text-xs text-[#4f6278] leading-relaxed">
          Este asistente apoya el razonamiento experimental, no sustituye la supervisión técnica ni decisiones clínicas. Cada recomendación debe validarse por el equipo.
        </p>
      </div>

      {/* Grid General */}
      <div className="flex flex-col gap-6">

        {/* Fila 1: Progreso + Insights IA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Tarjeta de Insights de IA */}
          <div className="bg-[#f7fbff] border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col relative stagger-in" style={{ animationDelay: '90ms' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-accent rounded-t-xl"></div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                <FiZap className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">EN QUE PUEDO AYUDARTE</h2>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed z-10 flex-1">
              “{aiMessage}”
            </p>
            
            <button 
              onClick={() => navigate('/app/lab')}
              className="mt-4 text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1 group"
            >
              Abrir asistente para revisar evidencia <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
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
              className="bg-white border border-lab-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start stagger-in"
              style={{ animationDelay: '160ms' }}
            >
              <div className="w-10 h-10 rounded bg-green-50 flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Escáner de Seguridad</h2>
              <p className="text-xs text-muted mb-4">Interpreta protocolos, genera checklist trazable y destaca límites de seguridad en contextos biológicos o clínicos.</p>
              <span className="text-xs font-semibold text-green-600 mt-auto group-hover:underline">Abrir escáner &rarr;</span>
            </div>

            {/* Atajo 2: Tareas */}
            <div 
              onClick={() => navigate('/app/tareas')}
              className="bg-white border border-lab-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col items-start stagger-in"
              style={{ animationDelay: '220ms' }}
            >
              <div className="w-10 h-10 rounded bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-1">Centro de Tareas</h2>
              <p className="text-xs text-gray-500 mb-4">Gestiona evidencia experimental, revisiones del agente y estado de aprobación por calidad y seguridad.</p>
              <span className="text-xs font-semibold text-orange-500 mt-auto group-hover:underline">Ver validaciones &rarr;</span>
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-surface border border-lab-border rounded-xl p-6 shadow-sm flex flex-col stagger-in" style={{ animationDelay: '280ms' }}>
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
