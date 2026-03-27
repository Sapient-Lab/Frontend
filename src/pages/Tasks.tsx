import { useState, useEffect } from 'react';
import { FiCheckCircle, FiCircle, FiCpu, FiTarget, FiBox } from 'react-icons/fi';
import { dynamicTaskService } from '../services/dynamicTaskService';
import type { DynamicTask } from '../services/dynamicTaskService';
import robotIcon2 from '../assets/robot-icon2.png'; 

export default function TasksAndEvaluation() {
  const [tasks, setTasks] = useState<DynamicTask[]>(dynamicTaskService.getTasks());

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
    <div className="h-full w-full overflow-y-auto p-8 lg:p-10 relative bg-gradient-to-br from-[#0a0f1c] via-[#0c1220] to-[#0b1020]">
      
      {/* Fondo con grid científico */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Partículas flotantes suaves */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float-gentle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(59,130,246,${Math.random() * 0.3 + 0.1}), rgba(139,92,246,${Math.random() * 0.15}))`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${Math.random() * 20 + 15}s`,
          }}
        />
      ))}
      
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 animate-fade-in fade-in-stagger">
        
        {/* Header con Robot */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center shadow-lg">
                <FiTarget className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Tareas y Asignaciones
                </h1>
                <p className="text-xs font-mono text-accent tracking-wider">GESTIÓN DE TAREAS ASIGNADAS POR IA</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm font-mono mt-1">
              Gestiona las tareas asignadas por las diferentes inteligencias artificiales de SapientLab.
            </p>
          </div>
          
          {/* Robot Animado con check */}
          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-full blur-xl animate-pulse-slow" />
            <img 
              src={robotIcon2} 
              alt="Robot verificando tareas"
              className="w-28 h-35 lg:w-32 lg:h-32 object-contain relative z-10 animate-float-robot hover:scale-110 transition-transform duration-500 cursor-pointer"
            />
            <div className="absolute -top-2 -right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <div className="absolute bottom-0 left-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Row de métricas - estilo científico */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-5 flex items-center hover:border-accent/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiBox className="text-white text-xl" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-accent uppercase tracking-wider">Total Tareas</p>
                <p className="text-3xl font-bold text-slate-100">{tasks.length}</p>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-5 flex items-center hover:border-orange-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiTarget className="text-white text-xl" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-orange-400 uppercase tracking-wider">Pendientes</p>
                <p className="text-3xl font-bold text-slate-100">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <div className="relative bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl p-5 flex items-center hover:border-emerald-500/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FiCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Completadas</p>
                <p className="text-3xl font-bold text-slate-100">{tasks.length - pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Tareas */}
        <div className="bg-[#0f1624]/80 backdrop-blur-sm border border-accent/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
          <div className="bg-accent/5 border-b border-accent/20 px-6 py-4 flex items-center justify-between">
            <h2 className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">Resumen de asignaciones</h2>
            <span className="text-[9px] font-mono bg-accent/10 border border-accent/30 px-3 py-1 rounded-full text-accent">
              Inteligencia Artificial Activa
            </span>
          </div>
          
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto divide-y divide-accent/10 custom-scrollbar">
            {tasks.map(task => (
              <div 
                key={task.id} 
                className={`p-6 flex items-start transition-all duration-300 hover:bg-accent/5 border-l-[3px] ${
                  task.status === 'completed' 
                    ? 'border-transparent opacity-60' 
                    : 'border-accent'
                }`}
              >
                <button 
                  onClick={() => toggleTaskStatus(task.id)}
                  className="mt-1 mr-5 focus:outline-none flex-shrink-0 group"
                >
                  {task.status === 'completed' ? (
                    <FiCheckCircle className="text-3xl text-emerald-500 hover:text-emerald-400 transition-colors group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <FiCircle className="text-3xl text-slate-600 hover:text-accent transition-colors group-hover:scale-110 transition-transform duration-300" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className={`font-bold text-lg font-mono ${task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {task.title}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-500 bg-accent/5 border border-accent/20 px-2.5 py-1 rounded-md sm:ml-4 whitespace-nowrap mt-2 sm:mt-0">
                      {task.date}
                    </span>
                  </div>
                  
                  <p className={`mb-3 text-sm font-mono ${task.status === 'completed' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {task.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold">
                      <FiCpu className="mr-1.5 w-3 h-3" /> Asignado por: {task.aiAssigner}
                    </div>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <FiCheckCircle className="text-3xl text-accent/40" />
                </div>
                <p className="text-lg font-mono font-medium text-slate-300">No hay tareas pendientes</p>
                <p className="text-xs font-mono text-slate-500 mt-1">Las IA's recomendarán tareas mientras trabajas. Las verás aquí.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-15px) translateX(8px);
            opacity: 0.5;
          }
        }
        
        @keyframes float-robot {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(1deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        
        .animate-float-robot {
          animation: float-robot 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(59, 130, 246, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}