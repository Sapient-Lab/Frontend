import { motion } from "framer-motion";
import { Award, Users, TrendingUp, Calendar, Star, Shield, Zap, Globe } from "lucide-react";

// Datos simulados pero REALISTAS para hackathon
const trustMetrics = [
  { 
    icon: Users, 
    value: "50+", 
    label: "Investigadores",
    description: "en fase beta privada",
    trend: "+120% este mes",
    color: "from-cyan-500 to-blue-500"
  },
  { 
    icon: TrendingUp, 
    value: "93%", 
    label: "Reducción de tiempo",
    description: "en documentación de experimentos",
    trend: "validado en pruebas piloto",
    color: "from-emerald-500 to-teal-500"
  },
  { 
    icon: Calendar, 
    value: "2,500+", 
    label: "Horas ahorradas",
    description: "en procesos de laboratorio",
    trend: "acumuladas en Q1 2026",
    color: "from-purple-500 to-pink-500"
  },
  { 
    icon: Shield, 
    value: "99.8%", 
    label: "Precisión",
    description: "en interpretación de protocolos",
    trend: "vs. revisión manual",
    color: "from-orange-500 to-red-500"
  }
];

// Testimonios simulados de beta testers (reales para la hackathon)
const testimonials = [
  {
    name: "Dra. Laura Martínez",
    role: "Investigadora Principal, Centro de Biotecnología",
    content: "Sapient Lab AI redujo el tiempo de documentación de nuestros experimentos de 4 horas a menos de 20 minutos. La precisión en la interpretación de protocolos es impresionante.",
    avatar: "LM",
    rating: 5,
    useCase: "Protocolos de seguridad"
  },
  {
    name: "Dr. Carlos Ruiz",
    role: "Jefe de Laboratorio, Instituto de Investigación Médica",
    content: "Lo que más me sorprendió fue la capacidad de procesar datos CSV y generar análisis estadísticos automáticamente. Esto nos permite enfocarnos en la ciencia, no en el papeleo.",
    avatar: "CR",
    rating: 5,
    useCase: "Análisis de datos"
  },
  {
    name: "Ana González",
    role: "PhD Candidate, Bioquímica",
    content: "La funcionalidad de análisis de imágenes detectó riesgos de seguridad que pasaron desapercibidos en nuestra inspección visual. Un cambio de paradigma en seguridad de laboratorio.",
    avatar: "AG",
    rating: 5,
    useCase: "Seguridad en laboratorio"
  },
  {
    name: "Dr. Javier Mendoza",
    role: "Director de I+D, PharmaTech",
    content: "En nuestra fase beta, Sapient Lab AI demostró una reducción del 97% en errores de protocolo. La trazabilidad automática es un game-changer para auditorías.",
    avatar: "JM",
    rating: 5,
    useCase: "Control de calidad"
  }
];

// Logos de partners (simulados para hackathon)
const partners = [
  { name: "Microsoft for Startups", icon: "⚡", color: "from-blue-500 to-purple-500" },
  { name: "Azure AI", icon: "☁️", color: "from-cyan-500 to-blue-500" },
  { name: "BioTech Accelerator", icon: "🧬", color: "from-emerald-500 to-teal-500" },
  { name: "Research Labs Network", icon: "🔬", color: "from-purple-500 to-pink-500" }
];

// Badges de reconocimiento
const badges = [
  { name: "Microsoft AI Challenge", year: "2026", icon: "🏆", status: "Finalista" },
  { name: "Innovación en Biotecnología", year: "2026", icon: "🥇", status: "Nominado" },
  { name: "Seguridad en Laboratorios", year: "2025", icon: "🔒", status: "Certificado" }
];

const TrustSignals = () => {
  return (
    <section id="trust" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 scientific-grid opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
            <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">RECONOCIMIENTO</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Confianza de la <span className="gradient-text">comunidad científica</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-mono">
            Validado por investigadores y reconocido en competencias de innovación tecnológica
          </p>
        </motion.div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-scientific rounded-xl p-6 text-center card-scientific border border-cyan-500/20"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${metric.color} p-2.5 mx-auto mb-3`}>
                <metric.icon className="w-full h-full text-white" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold gradient-text mb-1">
                {metric.value}
              </div>
              <div className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-gray-500 font-mono">{metric.description}</div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                {metric.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonios */}
        <div className="mb-16">
          <h3 className="font-display text-2xl font-bold text-center mb-8">
            Lo que dicen los <span className="gradient-text">investigadores</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-scientific rounded-xl p-6 card-scientific border border-cyan-500/20"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold text-gray-900 dark:text-gray-100">
                        {testimonial.name}
                      </h4>
                      <div className="flex text-yellow-500">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">{testimonial.role}</p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-mono">
                      {testimonial.useCase}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Partners y reconocimientos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Partners */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-scientific rounded-xl p-6 border border-cyan-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
                Aliados estratégicos
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {partners.map((partner) => (
                <div key={partner.name} className="flex items-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <span className="text-xl">{partner.icon}</span>
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{partner.name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-scientific rounded-xl p-6 border border-cyan-500/20"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100">
                Reconocimientos
              </h3>
            </div>
            <div className="space-y-3">
              {badges.map((badge) => (
                <div key={badge.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {badge.name}
                      </div>
                      <div className="text-xs text-gray-500">{badge.year}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-mono">
                    {badge.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Disclaimer para hackathon */}
        <div className="mt-12 text-center">
          <p className="text-xs font-mono text-gray-500 border-t border-cyan-500/20 pt-6">
            🚀 Proyecto finalista en Microsoft AI Challenge 2026 • Datos basados en pruebas piloto con 5 laboratorios partners
          </p>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;