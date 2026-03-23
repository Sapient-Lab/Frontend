import { motion } from "framer-motion";
import { Zap, Target, DollarSign, Clock, Award, TrendingUp } from "lucide-react";

const metrics = [
  { icon: Zap, value: "< 2s", label: "Análisis", desc: "Tiempo de procesamiento", color: "from-cyan-500 to-blue-500" },
  { icon: Target, value: "99.8%", label: "Precisión", desc: "Tasa de exactitud", color: "from-emerald-500 to-teal-500" },
  { icon: DollarSign, value: "USD 0.20", label: "Por Exp.", desc: "Costo por experimento", color: "from-purple-500 to-pink-500" },
  { icon: Clock, value: "24/7", label: "Disponibilidad", desc: "Soporte continuo", color: "from-orange-500 to-red-500" },
  { icon: Award, value: "100%", label: "Trazabilidad", desc: "Auditoría completa", color: "from-blue-500 to-cyan-500" },
  { icon: TrendingUp, value: "93%", label: "Eficiencia", desc: "Mejora documentada", color: "from-violet-500 to-purple-500" },
];

const MetricsSection = () => {
  return (
    <section id="metrics" className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-scientific rounded-xl p-6 text-center card-scientific border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${m.color} p-2.5 mx-auto mb-3 shadow-lg`}>
                <m.icon className="w-full h-full text-white" />
              </div>
              <div className="font-display text-2xl font-bold gradient-text mb-1">
                {m.value}
              </div>
              <div className="font-mono text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{m.label}</div>
              <div className="text-gray-500 text-xs font-mono">{m.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsSection;