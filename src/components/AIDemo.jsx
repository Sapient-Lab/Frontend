import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, AlertCircle, CheckCircle, Sparkles } from "lucide-react";

const AIDemo = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content: "👋 Hola investigador, soy Sapient AI. ¿En qué protocolo o experimento puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const botResponses = [
        "Analizando tu protocolo... He identificado que el paso 3 podría optimizarse reduciendo la temperatura a 37°C.",
        "Basado en datos históricos, sugiero aumentar la concentración de reactivo en un 15% para mejorar el rendimiento.",
        "⚠️ Alerta de seguridad: Asegúrate de usar guantes resistentes a ácidos para este procedimiento.",
        "He procesado tu CSV. Los resultados muestran una correlación significativa (p < 0.01) entre las variables.",
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: randomResponse,
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section id="demo" className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">INTERACTIVE DEMO</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gray-900 dark:text-gray-200">Prueba la IA en acción</span>
            <br />
            <span className="gradient-text">Asistente experimental</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-mono">
            Simula una conversación con nuestro asistente de laboratorio
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto glass-scientific rounded-xl border border-cyan-500/20 overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 p-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bot className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="font-mono text-sm font-semibold text-cyan-700 dark:text-cyan-400">Sapient AI Assistant</h3>
                <p className="text-xs text-gray-500 font-mono">Online · Research Mode</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-black/20">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.type === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 text-white"
                        : "bg-white dark:bg-gray-900 border border-cyan-500/20 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    <p className="text-sm font-mono leading-relaxed">{message.content}</p>
                  </div>
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-900 border border-cyan-500/20 rounded-lg p-3">
                    <Loader2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-cyan-500/20 bg-white/80 dark:bg-black/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Describe tu protocolo o experimento..."
                className="flex-1 bg-gray-100 dark:bg-gray-900 border border-cyan-500/30 rounded-lg px-4 py-2 text-sm font-mono text-gray-800 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-600 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex gap-3 mt-3 text-xs text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-500" />
                Análisis en tiempo real
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />
                Seguridad activa
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AIDemo;