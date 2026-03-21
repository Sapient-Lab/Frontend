import { useState } from 'react';

type TaskStatus = 'pending' | 'evaluating' | 'approved' | 'rejected';

type Task = {
  id: string;
  title: string;
  module: string;
  dueDate: string;
  status: TaskStatus;
  feedback?: string;
};

const mockTasks: Task[] = [
  { id: 't1', title: 'Entregar Repositorio Base', module: '2. Setup', dueDate: 'Hoy, 23:59', status: 'pending' },
  { id: 't2', title: 'Desplegar API en Vercel', module: '3. API REST', dueDate: 'Mañana, 20:00', status: 'pending' },
  { id: 't3', title: 'Script de Limpieza de Datos', module: '1. Introducción', dueDate: 'Hace 2 días', status: 'approved', feedback: 'Excelente uso de expresiones regulares. Código limpio y eficiente.' },
  { id: 't4', title: 'Endpoint Login con JWT', module: '4. Microservicios', dueDate: 'La próxima semana', status: 'rejected', feedback: 'Falta implementar la expiración de tokens. Revisa la documentación de seguridad.' },
];

export default function TasksAndEvaluation() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(mockTasks[0]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [fileOrLink, setFileOrLink] = useState('');

  const handleSimulateSubmit = () => {
    if (!fileOrLink) return;
    setIsEvaluating(true);
    
    // Simulamos que el evaluador tarda en procesar
    setTimeout(() => {
      setIsEvaluating(false);
      alert('¡Módulo evaluado automáticamente por la IA! Resultado guardado.');
      if (selectedTask) {
        // En una app real actualizamos el estado, aquí solo vaciamos el input
        setFileOrLink('');
      }
    }, 2000);
  };

  const getStatusChip = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pendiente</span>;
      case 'evaluating': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Evaluando...</span>;
      case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Aprobado</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Corregir</span>;
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#fbfbfb] flex flex-col sm:flex-row">
      
      {/* Sidebar de Tareas */}
      <div className="w-full sm:w-1/3 max-w-[320px] bg-white border-r border-lab-border overflow-y-auto flex flex-col">
        <div className="p-5 border-b border-lab-border sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Centro de Tareas</h2>
          <p className="text-xs text-gray-500 mt-1">Selecciona una entrega para ver detalles</p>
        </div>
        
        <div className="flex-1 p-3 space-y-2">
          {mockTasks.map(task => (
            <button 
              key={task.id} 
              onClick={() => setSelectedTask(task)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedTask?.id === task.id ? 'bg-accent-light/50 border-accent shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-mono text-gray-500">{task.module}</span>
                {getStatusChip(task.status)}
              </div>
              <h3 className={`font-semibold text-[13px] ${selectedTask?.id === task.id ? 'text-accent' : 'text-gray-800'}`}>
                {task.title}
              </h3>
              <div className="mt-2 text-[10px] font-mono text-gray-400 flex items-center gap-1">
                📅 Vence: {task.dueDate}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detalle y Evaluador */}
      <div className="flex-1 bg-lab-bg p-6 lg:p-10 overflow-y-auto">
        {selectedTask ? (
          <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4">
            
            {/* Header Detalle */}
            <div className="bg-white rounded-xl p-6 border border-lab-border shadow-sm flex justify-between items-start">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-widest mb-1 block">
                  {selectedTask.module}
                </span>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedTask.title}</h1>
                <p className="text-sm text-gray-500">Fecha límite: <span className="font-mono bg-gray-100 px-1 rounded">{selectedTask.dueDate}</span></p>
              </div>
              <div className="scale-125">
                {getStatusChip(selectedTask.status)}
              </div>
            </div>

            {/* Panel de Retroalimentacion si ya fue evaluado */}
            {selectedTask.feedback && (
              <div className={`p-5 rounded-lg border ${selectedTask.status === 'approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className={`text-sm font-bold flex items-center gap-2 mb-2 ${selectedTask.status === 'approved' ? 'text-green-800' : 'text-red-800'}`}>
                  {selectedTask.status === 'approved' ? '🎉 IA: Excelente trabajo' : '⚠️ IA: Puntos de mejora'}
                </h3>
                <p className={`text-sm ${selectedTask.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                  {selectedTask.feedback}
                </p>
              </div>
            )}

            {/* Consola de Entrega / Evaluador */}
            {(selectedTask.status === 'pending' || selectedTask.status === 'rejected') && (
              <div className="bg-white rounded-xl border border-lab-border shadow-sm flex flex-col overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <h3 className="text-sm font-bold text-gray-700">Subir y Evaluar con IA</h3>
                </div>
                
                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pega tu link de repositorio o código para analizar:
                  </label>
                  <textarea 
                    value={fileOrLink}
                    onChange={(e) => setFileOrLink(e.target.value)}
                    className="w-full min-h-[120px] p-3 text-sm font-mono bg-gray-50 border border-lab-border rounded-lg focus:outline-none focus:border-accent resize-none mb-4"
                    placeholder="https://github.com/usuario/mi-repo&#10;o pega el código directamente aquí..."
                  />
                  
                  <div className="flex justify-end gap-3">
                    <button className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-50 transition-colors">
                      Guardar Borrador
                    </button>
                    <button 
                      onClick={handleSimulateSubmit}
                      disabled={isEvaluating || !fileOrLink}
                      className={`px-5 py-2 rounded text-sm font-medium text-white transition-colors flex items-center gap-2 ${
                        isEvaluating || !fileOrLink ? 'bg-muted cursor-not-allowed' : 'bg-accent hover:bg-accent-dim'
                      }`}
                    >
                      {isEvaluating ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                          Analizando Tarea...
                        </>
                      ) : (
                        'Enviar para Evaluación'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-5xl mb-4">🎯</span>
            <p className="text-sm">Selecciona una tarea de la lista para ver el detalle y entregar.</p>
          </div>
        )}
      </div>

    </div>
  );
}
