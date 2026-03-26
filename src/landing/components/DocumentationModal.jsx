import { useState, useEffect } from 'react';
import { X, BookOpen, Code, FileText, HelpCircle, CheckCircle, Zap, Shield, FlaskConical, Cloud, Mic, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiEdit3, FiBarChart2, FiShield, FiMic, FiCloud, FiEye, FiFileText, FiHelpCircle, FiArrowRight, FiCheckCircle, FiRefreshCw, FiServer, FiBookOpen, FiZap, FiLoader, FiGrid } from 'react-icons/fi';
import { FaGamepad, FaRobot, FaReact, FaRocket } from 'react-icons/fa';
import { FaPalette } from 'react-icons/fa6';
import { SiMysql, SiNestjs } from 'react-icons/si';

const DocumentationModal = ({ isOpen, onClose }) => {
  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-cyan-500/20"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold gradient-text">Documentación</h2>
                <p className="text-xs text-gray-500 font-mono">Sapient Lab AI v2.0</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto p-6 space-y-8" style={{ maxHeight: 'calc(85vh - 80px)' }}>
            {/* Inicio rápido */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-600" />
                Inicio rápido
              </h3>
              <div className="space-y-3">
                {[
                  { step: 1, text: "Prueba la demo interactiva abajo en esta página", icon: FaGamepad },
                  { step: 2, text: "Selecciona CSV, Protocolo o Imagen", icon: FiFolder },
                  { step: 3, text: "Ingresa tus datos o usa el ejemplo", icon: FiEdit3 },
                  { step: 4, text: "Recibe análisis y recomendaciones de IA", icon: FaRobot }
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-mono font-bold">
                      {item.step}
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.text}</span>
                    <span className="ml-auto text-xl text-cyan-600 dark:text-cyan-400">
                      <item.icon className="w-5 h-5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Endpoints - LO QUE REALMENTE TIENES EN TU BACKEND */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-600" />
                API Endpoints disponibles
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">POST</span>
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300">/api/ai/results/analyze</code>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Análisis de datos CSV y resultados experimentales</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">POST</span>
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300">/api/ai/protocol/interpret</code>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Interpretación de protocolos con checklist de seguridad</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">POST</span>
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300">/api/ai/images/analyze</code>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Análisis de imágenes de laboratorio con Azure Vision</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">POST</span>
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300">/api/ai/copilot/chat</code>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Chat con asistente IA para consultas de laboratorio</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border-l-4 border-cyan-500">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600">POST</span>
                    <code className="text-xs font-mono text-gray-700 dark:text-gray-300">/api/ai/speech-to-text</code>
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Transcripción de voz para dictado de laboratorio</p>
                </div>
              </div>
            </div>

            {/* Casos de uso */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                Casos de uso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { title: "Análisis de experimentos", desc: "Procesa datos CSV automáticamente", icon: FiBarChart2 },
                  { title: "Seguridad en laboratorio", desc: "Detecta riesgos en protocolos", icon: FiShield },
                  { title: "Documentación automática", desc: "Genera informes y bitácoras", icon: FiFileText },
                  { title: "Dictado por voz", desc: "Transcripción de notas de laboratorio", icon: FiMic }
                ].map((useCase) => (
                  <div key={useCase.title} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <useCase.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-1">{useCase.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{useCase.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tecnologías utilizadas - LO QUE REALMENTE USAS */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-cyan-600" />
                Stack tecnológico
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "NestJS", desc: "Backend API", icon: SiNestjs },
                  { name: "Azure AI Foundry", desc: "Plataforma de IA", icon: FiCloud },
                  { name: "Azure OpenAI", desc: "Modelos GPT", icon: FaRobot },
                  { name: "Azure Vision", desc: "Análisis de imágenes", icon: FiEye },
                  { name: "Azure Speech", desc: "Voz y transcripción", icon: FiMic },
                  { name: "React", desc: "Frontend", icon: FaReact },
                  { name: "Tailwind CSS", desc: "Estilos", icon: FaPalette },
                  { name: "MySQL", desc: "Base de datos", icon: SiMysql }
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <tech.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <p className="text-sm font-semibold">{tech.name}</p>
                      <p className="text-xs text-gray-500">{tech.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-600" />
                Preguntas frecuentes
              </h3>
              <div className="space-y-3">
                {[
                  { q: "¿Qué formatos soporta?", a: "CSV, texto plano, imágenes (JPG/PNG), audio" },
                  { q: "¿Cómo funciona la IA?", a: "Usa Azure OpenAI para análisis y generación de respuestas" },
                  { q: "¿Necesito instalar algo?", a: "No, es 100% web - solo abre el navegador" },
                  { q: "¿Es gratuito?", a: "Demo gratuita disponible durante la hackathon" }
                ].map((faq) => (
                  <div key={faq.q} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <FiHelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      {faq.q}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-6 flex items-start gap-2">
                      <FiArrowRight className="w-3.5 h-3.5 mt-0.5 text-cyan-500 shrink-0" />
                      <span>{faq.a}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sobre el proyecto */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-600" />
                Sobre el proyecto
              </h3>
              <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <FaRocket className="w-4 h-4" />
                    Microsoft AI Challenge 2026
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Sapient Lab AI es un asistente inteligente para laboratorios desarrollado 
                  con servicios de Azure AI. Automatiza el análisis de datos experimentales, 
                  interpreta protocolos de seguridad y asiste en la documentación de laboratorio.
                </p>
                <div className="mt-3 pt-3 border-t border-cyan-500/30">
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Endpoints implementados y funcionando con Azure AI Services</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <FiRefreshCw className="w-3.5 h-3.5 text-cyan-500" />
                    <span>En desarrollo: Integración con Azure Agents para flujos autónomos</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DocumentationModal;