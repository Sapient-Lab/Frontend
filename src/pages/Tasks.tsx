import { useState, useEffect } from 'react';
import { FiCheckCircle, FiCircle, FiCpu, FiTarget, FiBox } from 'react-icons/fi';
import { dynamicTaskService } from '../services/dynamicTaskService';
import type { DynamicTask } from '../services/dynamicTaskService';

export default function TasksAndEvaluation() {
  const [tasks, setTasks] = useState<DynamicTask[]>(dynamicTaskService.getTasks());

  // Escuchar eventos de tareas actualizadas
  useEffect(() => {
    const handleTasksUpdated = (event: any) => {
      setTasks(event.detail.tasks);
    };

    window.addEventListener('tasksUpdated', handleTasksUpdated);
    return () => window.removeEventListener('tasksUpdated', handleTasksUpdated);
  }, []);

  const toggleTaskStatus = (id: string) => {
    dynamicTaskService.toggleTaskStatus(id);
  };

  const deleteTask = (id: string) => {
    dynamicTaskService.deleteTask(id);
  };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in fade-in-stagger">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Tareas y Asignaciones</h1>
        <p className="text-gray-600">
          Gestiona las tareas asignadas por las diferentes inteligencias artificiales de SapientLab.
        </p>
      </header>

      {/* Row de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mr-4">
             <FiBox className="text-blue-500 text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Tareas</p>
            <p className="text-3xl font-black text-gray-800">{tasks.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mr-4">
             <FiTarget className="text-orange-500 text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pendientes</p>
            <p className="text-3xl font-black text-gray-800">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mr-4">
             <FiCheckCircle className="text-green-500 text-2xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completadas</p>
            <p className="text-3xl font-black text-gray-800">{tasks.length - pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-700 uppercase tracking-widest text-sm">Resumen de asignaciones</h2>
          <span className="text-xs font-semibold bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500">
            Inteligencia Artificial Activa
          </span>
        </div>
        
        <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
          {tasks.map(task => (
            <div key={task.id} className={`p-6 flex items-start transition-all hover:bg-gray-50 border-l-[3px] ${task.status === 'completed' ? 'border-transparent opacity-60' : 'border-accent'}`}>
              <button 
                onClick={() => toggleTaskStatus(task.id)}
                className="mt-1 mr-5 focus:outline-none flex-shrink-0"
              >
                {task.status === 'completed' ? (
                  <FiCheckCircle className="text-3xl text-green-500 hover:text-green-600 transition-colors" />
                ) : (
                  <FiCircle className="text-3xl text-gray-300 hover:text-accent transition-colors" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h3 className={`font-bold text-lg ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md sm:ml-4 whitespace-nowrap mt-2 sm:mt-0 table">
                    {task.date}
                  </span>
                </div>
                
                <p className={`mb-3 text-sm ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center bg-indigo-50/70 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold">
                    <FiCpu className="mr-1.5" /> Asignado por: {task.aiAssigner}
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {tasks.length === 0 && (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center">
              <FiCheckCircle className="text-5xl mb-4 text-gray-200" />
              <p className="text-lg font-medium">No hay tareas pendientes</p>
              <p className="text-sm">Las IA's recomendarán tareas mientras trabajas. Las verás aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
