import { Mail, Shield, FileText, Github, Twitter, Linkedin, FlaskConical } from "lucide-react";

const SapientFooter = () => {
  return (
    <footer className="border-t border-cyan-500/20 bg-gradient-to-b from-transparent to-cyan-950/30 dark:to-cyan-950/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span className="font-display text-sm font-bold tracking-widest gradient-text">
                SAPIENT LAB AI
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono max-w-md">
              Transformando la investigación científica con inteligencia artificial de grado clínico.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3">PLATAFORMA</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Características</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Precios</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Documentación</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">API</a></li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-mono text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-3">RECURSOS</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Blog científico</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Casos de estudio</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Soporte</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-mono">Estado del sistema</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-cyan-500/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-mono text-xs text-gray-500">
            © 2026 SAPIENT LAB AI · Todos los derechos reservados
          </div>
          
          <div className="flex items-center gap-6">
            {[
              { icon: Mail, label: "Contacto" },
              { icon: Shield, label: "Privacidad" },
              { icon: FileText, label: "Términos" },
            ].map(({ icon: Icon, label }) => (
              <a key={label} href="#" className="flex items-center gap-2 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors text-xs font-mono">
                <Icon size={12} />
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <Github size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <Twitter size={16} />
            </a>
            <a href="#" className="text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SapientFooter;