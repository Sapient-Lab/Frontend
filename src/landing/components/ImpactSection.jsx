import { motion } from "framer-motion";
import { TrendingUp, Award, BarChart, Target, Sparkles } from "lucide-react";

const data = [
  { metric: "Tiempo de documentación", before: "4.2 horas/exp", after: "18 min/exp", improvement: "↓ 93%", icon: TrendingUp },
  { metric: "Errores de protocolo", before: "12.3%", after: "0.4%", improvement: "↓ 97%", icon: Target },
  { metric: "Costo por experimento", before: "USD 8.50", after: "USD 0.20", improvement: "↓ 97.6%", icon: BarChart },
  { metric: "Tiempo de revisión", before: "2.1 horas", after: "6 min", improvement: "↓ 95%", icon: TrendingUp },
  { metric: "Trazabilidad", before: "Manual / Parcial", after: "100% Automática", improvement: "↑ 100%", icon: Award },
  { metric: "Compliance normativo", before: "72%", after: "99.8%", improvement: "↑ 38.6%", icon: Target },
];

const ImpactSection = () => {
  return (
    <section id="impact" className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">ROI & IMPACT</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900 dark:text-gray-200">Optimización de I+D</span>
            <br />
            <span className="gradient-text">2024–2026</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-scientific rounded-xl overflow-hidden border border-cyan-500/20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/30">
                  <th className="font-mono text-xs tracking-wider text-cyan-700 dark:text-cyan-400 px-6 py-4 text-left uppercase">Métrica</th>
                  <th className="font-mono text-xs tracking-wider text-gray-600 dark:text-gray-500 px-6 py-4 text-left uppercase">Antes</th>
                  <th className="font-mono text-xs tracking-wider text-emerald-700 dark:text-emerald-400 px-6 py-4 text-left uppercase">Después</th>
                  <th className="font-mono text-xs tracking-wider text-cyan-700 dark:text-cyan-400 px-6 py-4 text-left uppercase">Mejora</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <row.icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{row.metric}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-500 font-mono">{row.before}</td>
                    <td className="px-6 py-4 text-emerald-700 dark:text-emerald-400 font-semibold font-mono">{row.after}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30">
                        {row.improvement}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ImpactSection;