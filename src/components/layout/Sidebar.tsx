import type { SidebarModule } from '../../types/navigation'

const modules: SidebarModule[] = [
  { id: '1', label: 'Introducción',          status: 'done'   },
  { id: '2', label: 'Setup del entorno',      status: 'done'   },
  { id: '3', label: 'API REST con Spring',    status: 'active' },
  { id: '4', label: 'Microservicios',         status: 'locked' },
  { id: '5', label: 'Base de datos',          status: 'locked' },
  { id: '6', label: 'React + Consumo API',    status: 'locked' },
  { id: '7', label: 'Despliegue / Vercel',    status: 'locked' },
]

const resources = ['Documentación', 'Ejemplos de código', 'Guía de entrega']

const statusTag: Record<SidebarModule['status'], { label: string; className: string }> = {
  done:   { label: 'done',  className: 'bg-green-50 text-green-700' },
  active: { label: 'activo', className: 'bg-accent-light text-accent-dim' },
  locked: { label: 'pronto', className: 'bg-lab-bg text-muted border border-lab-border' },
}

const dotColor: Record<SidebarModule['status'], string> = {
  done:   'bg-green-600',
  active: 'bg-accent',
  locked: 'bg-lab-border',
}

const itemBase = 'flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] cursor-pointer transition-all border-l-2'

export default function Sidebar() {
  return (
    <aside className="w-[240px] bg-surface border-r border-lab-border py-5 overflow-y-auto">

      {/* Módulos */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-5 pb-2">
          Módulos
        </p>
        {modules.map((mod) => {
          const isActive = mod.status === 'active'
          const tag = statusTag[mod.status]
          return (
            <div
              key={mod.id}
              className={`${itemBase} ${
                isActive
                  ? 'bg-accent-light text-accent border-accent font-medium'
                  : 'text-gray-500 border-transparent hover:bg-lab-bg hover:text-gray-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[mod.status]}`} />
              <span className="flex-1">{mod.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${tag.className}`}>
                {tag.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Recursos */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted px-5 pb-2">
          Recursos
        </p>
        {resources.map((r) => (
          <div key={r} className={`${itemBase} text-gray-500 border-transparent hover:bg-lab-bg hover:text-gray-800`}>
            <span className="w-2 h-2 rounded-full flex-shrink-0 bg-lab-border" />
            {r}
          </div>
        ))}
      </div>

    </aside>
  )
}