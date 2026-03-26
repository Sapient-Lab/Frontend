// Servicio para gestionar tareas dinámicas desde recomendaciones de IAs

export interface DynamicTask {
  id: string;
  title: string;
  description: string;
  aiAssigner: string;
  status: 'pending' | 'completed';
  date: string;
}

const STORAGE_KEY = 'sapientlab_dynamic_tasks';

export const dynamicTaskService = {
  // Obtener todas las tareas
  getTasks(): DynamicTask[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Agregar nueva tarea desde recomendación de IA
  addTask(title: string, description: string, aiAssigner: string): DynamicTask {
    const tasks = this.getTasks();
    
    const newTask: DynamicTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      aiAssigner,
      status: 'pending',
      date: new Date().toLocaleString('es-ES')
    };

    tasks.push(newTask);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    
    // Emitir evento para que componentes se actualicen
    window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { tasks } }));
    
    return newTask;
  },

  // Toggle estado de tarea
  toggleTaskStatus(taskId: string): DynamicTask | null {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      task.status = task.status === 'pending' ? 'completed' : 'pending';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { tasks } }));
      return task;
    }
    
    return null;
  },

  // Eliminar tarea
  deleteTask(taskId: string): void {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { tasks: filtered } }));
  },

  // Obtener estadísticas
  getStats() {
    const tasks = this.getTasks();
    const pending = tasks.filter(t => t.status === 'pending').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    return {
      total: tasks.length,
      pending,
      completed
    };
  },

  // Limpiar todas las tareas (para testing)
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('tasksUpdated', { detail: { tasks: [] } }));
  }
};
