import { FiPlus, FiCheckCircle, FiAward } from 'react-icons/fi';
import { useState } from 'react';
import { dynamicTaskService } from '../services/dynamicTaskService';

export interface TaskRecommendationItem {
  title: string;
  description: string;
  aiAssigner: string;
}

interface TaskRecommendationProps {
  recommendations: TaskRecommendationItem[];
}

export default function TaskRecommendation({ recommendations }: TaskRecommendationProps) {
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set());

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const handleAddTask = (task: TaskRecommendationItem) => {
    // Agregar a tareas dinámicas
    dynamicTaskService.addTask(task.title, task.description, task.aiAssigner);
    
    // Mostrar confirmación visual
    setAddedTasks(prev => new Set(prev).add(task.title));
    
    // Reset después de 2 segundos
    setTimeout(() => {
      setAddedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(task.title);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="mt-6 pt-6 border-t border-accent/20">
      <h3 className="text-sm font-semibold text-accent mb-4 flex items-center gap-2">
        <FiAward className="text-accent" /> Puedes hacer esto:
      </h3>
      
      <div className="space-y-3">
        {recommendations.map((task, idx) => (
          <div 
            key={idx}
            className="flex gap-3 p-3 bg-accent/5 border border-accent/20 rounded-lg hover:bg-accent/10 transition-colors"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-200">{task.title}</p>
              <p className="text-xs text-slate-400 mt-1">{task.description}</p>
              <p className="text-xs text-accent/70 mt-2">Sugerido por: {task.aiAssigner}</p>
            </div>
            
            <button
              onClick={() => handleAddTask(task)}
              className={`flex-shrink-0 px-3 py-2 rounded text-xs font-medium transition-colors ${
                addedTasks.has(task.title)
                  ? 'bg-green-500/80 text-white flex items-center gap-1'
                  : 'bg-accent text-[#0a0f1c] hover:bg-accent/90'
              }`}
            >
              {addedTasks.has(task.title) ? (
                <>
                  <FiCheckCircle className="w-3.5 h-3.5" />
                  Añadida
                </>
              ) : (
                <>
                  <FiPlus className="w-3.5 h-3.5" />
                  Añadir
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
