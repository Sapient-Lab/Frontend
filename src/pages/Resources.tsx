import { useState } from 'react';

type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'repo';
  description: string;
  module: string;
};

const mockResources: Resource[] = [
  { id: '1', title: 'Guía de Bioseguridad BSL-2', type: 'pdf', module: '1. Introducción', description: 'Documento oficial con normativas de manipulación.' },
  { id: '2', title: 'Tutorial: Primer Controller en Spring', type: 'video', module: '3. API REST', description: 'Paso a paso de cómo exponer un endpoint HTTP.' },
  { id: '3', title: 'Documentación Oficial NestJS', type: 'link', module: '4. Microservicios', description: 'Referencia a la página principal de Nest.' },
  { id: '4', title: 'Repositorio Plantilla Base', type: 'repo', module: '2. Setup', description: 'Código inicial del laboratorio para clonar.' },
  { id: '5', title: 'Esquema de Bases de Datos Relacionales', type: 'pdf', module: '5. Base de datos', description: 'Diagramas entidad-relación de ejemplo.' },
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
            Centro de Recursos y Documentación
          </h1>
          <p className="text-sm text-gray-500">
            Encuentra todo el material complementario, guías de estudio y referencias necesarias para completar tus módulos.
          </p>
        </div>

        {/* Buscador y Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input 
              type="text" 
              placeholder="Buscar por título o palabra clave..." 
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
              No se encontraron recursos que coincidan con tu búsqueda.
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
