import { useState, useEffect } from 'react';
import type { IconType } from 'react-icons';
import { FiCode, FiFileText, FiLink2, FiPlayCircle, FiSearch } from 'react-icons/fi';

type Resource = {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'repo';
  description: string;
  module: string;
  url?: string;
};

const typeIcons: Record<Resource['type'], IconType> = {
  pdf: FiFileText,
  link: FiLink2,
  video: FiPlayCircle,
  repo: FiCode,
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/platform/resources')
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((item: any) => ({
          ...item,
          module: `Módulo ${item.module}`,
          description: Array.isArray(item.tags) ? item.tags.join(', ') : 'Sin descripción'
        }));
        setResources(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const modules = ['Todos', ...Array.from(new Set(resources.map(r => r.module)))];

  const filtered = resources.filter(r => {
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
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              Cargando recursos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">
              No se encontraron recursos para los filtros seleccionados.
            </div>
          ) : (
            filtered.map(resource => (
              <div key={resource.id} className="bg-white border border-lab-border p-5 rounded-xl flex flex-col hover:shadow-md transition-shadow group">
                {(() => {
                  const ResourceIcon = typeIcons[resource.type] || FiFileText;
                  return (
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 group-hover:scale-105 transition-transform">
                      <ResourceIcon className="w-5 h-5 text-gray-700" />
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-accent-light text-accent px-2 py-1 rounded">
                    {resource.type.toUpperCase()}
                  </span>
                </div>
                  );
                })()}
                
                <h3 className="text-[15px] font-bold text-gray-800 leading-tight mb-1">
                  {resource.title}
                </h3>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">
                  {resource.module}
                </span>
                
                <p className="text-xs text-gray-500 mb-4 flex-1">
                  {resource.description}
                </p>

                  <button 
                    onClick={() => resource.url && window.open(resource.url, '_blank')}
                    className="w-full mt-auto py-2 border border-accent text-accent text-xs font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors"
                  >
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
