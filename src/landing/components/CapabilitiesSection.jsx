import { motion } from "framer-motion";
import { 
  Brain, FileCode, Cog, ShieldCheck,
  Database, Lock, Sparkles 
} from "lucide-react";

const capabilities = [
  { 
    icon: Brain, 
    title: "Explainable Reasoning",
    desc: "Every suggestion includes clear justification to support scientific decision-making.",
    color: "from-cyan-500 to-blue-500",
    path: "/app/lab"
  },
  { 
    icon: FileCode, 
    title: "Multimodal Analysis",
    desc: "Analyze text, CSV, image, and voice inside one notebook workflow.",
    color: "from-purple-500 to-pink-500",
    path: "/app/protocolos"
  },
  { 
    icon: Cog, 
    title: "Agent Orchestration",
    desc: "Interpret protocols, analyze results, and propose explained next-step variations.",
    color: "from-emerald-500 to-teal-500",
    path: "/app/lab"
  },
  { 
    icon: ShieldCheck, 
    title: "Strict Safety",
    desc: "Guardrails and filtering for sensitive biological and clinical scenarios.",
    color: "from-red-500 to-orange-500",
    path: "/login"
  },
  { 
    icon: Database, 
    title: "External Evidence",
    desc: "OpenML connector enriches recommendations with benchmark metadata.",
    color: "from-blue-500 to-cyan-500",
    path: "/app/docs"
  },
  { 
    icon: Lock, 
    title: "Human-in-the-Loop",
    desc: "AI assists reasoning, while final decisions always remain with researchers.",
    color: "from-violet-500 to-purple-500",
    path: "/login"
  },
];

const CapabilitiesSection = () => {
  return (
    <section id="capabilities" className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 scientific-grid opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">CORE CAPABILITIES</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">
              Scientific AI
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-200">Core Infrastructure</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-mono">
            Core capabilities aligned with the Innovation Challenge 2026 goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl p-6 transition-all duration-500 hover:scale-105 bg-white/80 dark:bg-gray-900/50 border border-cyan-500/20 hover:border-cyan-500/40 card-scientific"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${c.color} p-2.5 mb-4 shadow-lg`}>
                <c.icon className="w-full h-full text-white" />
              </div>
              
              <h3 className="font-display text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {c.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-mono">
                {c.desc}
              </p>
              
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;