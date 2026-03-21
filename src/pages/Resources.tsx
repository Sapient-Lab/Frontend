import { useState } from 'react';

type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'repo';
  description: string;
  module: string;
};

const mockResources: Resource[] = [
  { id: '1', title: 'Guía de Bioseguridad BSL-2', type: 'pdf', module: '1. Contexto del experimento', description: 'Normativas de manipulación, EPP y procedimientos de contingencia.' },
  { id: '2', title: 'Video: Buenas prácticas de documentación de laboratorio', type: 'video', module: '2. Ingesta de protocolo', description: 'Cómo registrar método, lotes y observaciones sin ambiguedad.' },
  { id: '3', title: 'Checklist de validación ética y regulatoria', type: 'link', module: '3. Evaluación de riesgo', description: 'Revisión previa para investigación con potencial impacto clínico.' },
  { id: '4', title: 'Plantilla de cuaderno experimental reproducible', type: 'repo', module: '4. Análisis de resultados', description: 'Estructura recomendada para trazabilidad y comparación entre corridas.' },
  { id: '5', title: 'Matriz de interpretación y límites de confianza', type: 'pdf', module: '5. Siguientes pasos', description: 'Criterios para decidir repetir, escalar o descartar hipótesis.' },
];

const typeIcons = {
  pdf: '📄', link: '🔗', video: '▶️', repo: '💻'
};

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('Todos');

  const modules = ['Todos', ...Array.from(new Set(mockResources.map(r => r.module)))];

  const filtered = mockResources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchModule = filterModule === 'Todos' || r.module === filterModule;
    return matchSearch && matchModule;
  });

  return (
    <div className="h-full w-full overflow-y-auto bg-[#fbfbfb] p-8 lg:p-10">
      <div className="max-w-5xl mx-auto flex flex-col h-full">
        
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight mb-2">
            Biblioteca Científica y Cumplimiento
          </h1>
          <p className="text-sm text-gray-500">
            Material de referencia para bioseguridad, interpretación responsable y decisiones auditables.
          </p>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por protocolo, riesgo o palabra clave..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-lab-border text-sm rounded-lg focus:outline-none focus:border-accent shadow-sm"
            />
          </div>
          <select 
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-white border border-lab-border text-sm rounded-lg focus:outline-none focus:border-accent shadow-sm"
          >
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Grid de Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">
              No se encontraron recursos para los filtros seleccionados.
            </div>
          ) : (
            filtered.map(resource => (
              <div key={resource.id} className="bg-white border border-lab-border p-5 rounded-xl flex flex-col hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 group-hover:scale-105 transition-transform">
                      {typeIcons[resource.type]}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-accent-light text-accent px-2 py-1 rounded">
                    {resource.type.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-[15px] font-bold text-gray-800 leading-tight mb-1">
                  {resource.title}
                </h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">
                  {resource.module}
                </span>
                
                <p className="text-xs text-gray-500 mb-4 flex-1">
                  {resource.description}
                </p>

                <button className="w-full mt-auto py-2 border border-accent text-accent text-xs font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors">
                  Abrir Recurso
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
