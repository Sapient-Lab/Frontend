import { useState } from 'react';
import { motion } from "framer-motion";
import BottleAnimation from "./BottleAnimation";
import { ArrowRight, Shield, Zap, Microscope, BookOpen, Play } from "lucide-react";
import DocumentationModal from "./DocumentationModal";

const HeroSection = () => {
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section id="home" className="min-h-screen flex items-center pt-16 overflow-hidden relative">
        {/* Fondo científico adaptativo */}
        <div className="absolute inset-0 scientific-grid" />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge científico */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6"
            >
              <Microscope className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">AI-POWERED RESEARCH PLATFORM</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="gradient-text">
                SAPIENT LAB AI
              </span>
              <br />
              <span className="text-gray-900 dark:text-gray-200">
                Asistente inteligente de laboratorio
              </span>
            </h1>
            
            <p className="text-gray-700 dark:text-gray-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg font-mono">
              Automatiza protocolos experimentales, procesa datos multi-formato y genera 
              justificaciones auditables con IA segura y explicable.
            </p>

            {/* Estadísticas rápidas */}
            <div className="flex gap-6 mb-8">
              <div className="group cursor-help">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">93%</div>
                <div className="text-xs text-gray-600 dark:text-gray-500 font-mono">Reducción de tiempo</div>
                <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  en documentación
                </div>
              </div>
              <div className="group cursor-help">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">99.8%</div>
                <div className="text-xs text-gray-600 dark:text-gray-500 font-mono">Precisión</div>
                <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  en interpretación
                </div>
              </div>
              <div className="group cursor-help">
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">24/7</div>
                <div className="text-xs text-gray-600 dark:text-gray-500 font-mono">Disponibilidad</div>
                <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  soporte continuo
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToDemo}
                className="font-mono text-sm font-semibold tracking-wider px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2 group"
              >
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                PROBAR DEMO
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDocsOpen(true)}
                className="font-mono text-sm font-semibold tracking-wider px-8 py-3 rounded-lg border border-cyan-600/40 dark:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                VER DOCUMENTACIÓN
              </motion.button>
            </div>

            {/* Sellos de seguridad - versión honesta */}
            <div className="flex gap-4 mt-8">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
                <Shield className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Azure AI Powered</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
                <Zap className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Microsoft Challenge 2026</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
                <Microscope className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                <span>Research Grade</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <BottleAnimation />
          </motion.div>
        </div>
      </section>

      {/* Modal de documentación */}
      <DocumentationModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </>
  );
};

export default HeroSection;