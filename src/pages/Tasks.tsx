import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCalendar, FiCheckCircle, FiCpu, FiTarget } from 'react-icons/fi';

type TaskStatus = 'pending' | 'evaluating' | 'approved' | 'rejected';

type Task = {
  id: string;
  title: string;
  module: string;
  dueDate: string;
  status: TaskStatus;
  feedback?: string;
  submission?: string;
};

export default function TasksAndEvaluation() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [fileOrLink, setFileOrLink] = useState('');

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/platform/tasks');
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          module: t.module,
          dueDate: t.due_date || t.dueDate || 'Sin fecha',
          status: t.status,
          feedback: t.feedback,
          submission: t.submission
        }));
        setTasks(mappedData);
        if (mappedData.length > 0) {
          setSelectedTask(current => {
            if (current) {
               const updated = mappedData.find((t: any) => t.id === current.id);
               return updated || mappedData[0];
            }
            return mappedData[0];
          });
        }
      }
    } catch (e) {
      console.error('Error fetching tasks', e);
    }
  };

  useEffect(() => {
    if (selectedTask && selectedTask.submission) {
      setFileOrLink(selectedTask.submission);
    } else {
      setFileOrLink('');
    }
  }, [selectedTask]);

  const handleSimulateSubmit = async () => {
    if (!fileOrLink || !selectedTask) return;
    setIsEvaluating(true);
    try {
      const res = await fetch('http://localhost:3000/api/platform/tasks/' + selectedTask.id + '/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fileOrLink })
      });
      if (res.ok) {
        alert('Enviado a análisis asistido con éxito.');
        await fetchTasks();
      } else {
        alert('Error al enviar.');
      }
    } catch (e) {
      console.error('Submit error:', e);
    } finally {
      setIsEvaluating(false);
    }
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
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Centro de Validación</h1>
        <p className="text-gray-600 mb-6">Selecciona una evidencia para revisar detalle</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de tareas */}
        <div className="lg:col-span-1 space-y-4 max-h-[800px] overflow-y-auto pr-2">
          {tasks.map(task => (
            <div 
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={"bg-white border rounded-xl p-4 cursor-pointer transition-all hover:border-accent " + (selectedTask?.id === task.id ? 'border-accent shadow-md' : 'border-gray-200')}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500 font-mono tracking-wider truncate mr-2">{task.module}</span>
                {getStatusChip(task.status)}
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-2">{task.title}</h3>
              <div className="flex items-center text-xs text-gray-500">
                <FiCalendar className="mr-1.5" /> Vence: {task.dueDate}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-gray-500">No hay tareas disponibles.</p>}
        </div>

        {/* Detalle y envio */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTask ? (
            <>
              {/* Card superior similar al diseno */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">{selectedTask.module}</span>
                  {getStatusChip(selectedTask.status)}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedTask.title}</h2>
                <div className="inline-flex items-center text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md">
                   Fecha límite:&nbsp;<span className="font-medium ml-1">{selectedTask.dueDate}</span>
                </div>
              </div>

              {/* Card de accion */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center">
                   <FiCpu className="text-gray-500 mr-2" /> <span className="font-semibold text-gray-700">Enviar a análisis asistido</span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-600 mb-4">Adjunta un enlace o pega evidencia experimental para analizar:</p>
                  <textarea
                    value={fileOrLink}
                    onChange={(e) => setFileOrLink(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg p-4 text-sm h-32 focus:ring-accent focus:border-accent resize-none placeholder-gray-400 font-mono"
                    placeholder="https://drive.google.com/... 
o pega tus observaciones y resultados aquí..."
                    disabled={selectedTask.status === 'approved' || selectedTask.status === 'evaluating'}
                  ></textarea>

                  {selectedTask.status === 'rejected' && selectedTask.feedback && (
                    <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-lg flex items-start">
                      <FiAlertTriangle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-red-800 mb-1">Feedback del Agente:</p>
                        <p className="text-sm text-red-600">{selectedTask.feedback}</p>
                      </div>
                    </div>
                  )}

                  {selectedTask.status === 'approved' && (
                    <div className="mt-4 bg-green-50 border border-green-100 p-4 rounded-lg flex items-start">
                      <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                         <p className="text-sm font-semibold text-green-800 mb-1">Validación Exitosa</p>
                         <p className="text-sm text-green-600">{selectedTask.feedback || 'Evidencia aprobada.'}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-3">
                    <button className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" disabled={selectedTask.status === 'approved' || selectedTask.status === 'evaluating'}>
                      Guardar Borrador
                    </button>
                    <button
                      onClick={handleSimulateSubmit}
                      disabled={!fileOrLink || ['approved','evaluating'].includes(selectedTask.status) || isEvaluating}
                      className={"px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors flex items-center " + ( !fileOrLink || ['approved','evaluating'].includes(selectedTask.status) ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-500 hover:bg-slate-600')}
                    >
                      {isEvaluating ? 'Enviando...' : 'Enviar para revisión'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border text-center rounded-xl p-10 h-full flex flex-col items-center justify-center text-gray-500">
               <FiTarget className="text-4xl text-gray-300 mb-4" />
               <p>Selecciona una tarea para ver detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}