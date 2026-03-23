import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Microscope, Upload, Loader2, CheckCircle, XCircle, Database, Beaker, Image } from 'lucide-react';

const useCases = [
  {
    id: 'csv',
    title: 'Análisis de CSV',
    endpoint: '/api/ai/results/analyze',
    icon: <Database className="w-5 h-5" />,
    description: 'Procesa datos experimentales en formato CSV y obtén análisis estadístico automático, detección de anomalías y recomendaciones.',
    placeholder: `Pega aquí tus datos CSV (temperatura, tiempo, concentración...)
Ejemplo:
timestamp,temperature,concentration
0,25.5,0.1
10,26.2,0.15
20,27.1,0.22`,
    example: `timestamp,temperature,concentration
0,25.5,0.1
10,26.2,0.15
20,27.1,0.22
30,28.0,0.31
40,28.5,0.45
50,29.1,0.62`
  },
  {
    id: 'protocol',
    title: 'Interpretación de Protocolos',
    endpoint: '/api/ai/protocol/interpret',
    icon: <Beaker className="w-5 h-5" />,
    description: 'Analiza protocolos experimentales y genera checklist de seguridad automatizado, identifica riesgos y sugiere medidas preventivas.',
    placeholder: 'Ingresa el texto del protocolo a interpretar...',
    example: `Preparación de solución de ácido clorhídrico 1M:
1. En campana de extracción, medir 83 mL de HCl concentrado (37%)
2. Agregar cuidadosamente a 500 mL de agua destilada en un vaso de precipitados
3. Agitar suavemente con varilla de vidrio
4. Enrasar a 1L con agua destilada
5. Etiquetar con fecha y concentración
Precauciones: Usar guantes de nitrilo, gafas de seguridad y bata. Mantener alejado de fuentes de ignición.`
  },
  {
    id: 'image',
    title: 'Análisis de Imágenes',
    endpoint: '/api/ai/images/analyze',
    icon: <Image className="w-5 h-5" />,
    description: 'Sube imágenes de laboratorio para detección automática de riesgos de seguridad, equipos mal ubicados o condiciones peligrosas.',
    placeholder: 'Describe la imagen o sube una URL de imagen de laboratorio...',
    example: `Imagen de laboratorio mostrando:
- Botella química sin etiqueta en la mesa
- Guantes de nitrilo usados en contacto con área limpia
- Microscopio con lente sucio
- Muestra biológica sin identificación`
  }
];

const InteractiveUseCases = () => {
  const [activeCase, setActiveCase] = useState('csv');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const currentUseCase = useCases.find(c => c.id === activeCase) || useCases[0];

  const handleExample = () => {
    setInput(currentUseCase.example);
    setResponse(null);
    setError(null);
  };

  const handleClear = () => {
    setInput('');
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('Por favor ingresa datos para analizar');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let body = {};
      
      // Preparar el body según el endpoint
      switch (activeCase) {
        case 'csv':
          body = {
            payload: input,
            format: 'csv',
            metricsOfInterest: ['temperature', 'concentration']
          };
          break;
        case 'protocol':
          body = {
            protocolText: input,
            riskLevel: 'medium',
            labContext: 'Análisis de seguridad de laboratorio'
          };
          break;
        case 'image':
          body = {
            base64Image: input, // En modo demo usamos texto
            prompt: 'Analiza esta imagen de laboratorio y destaca riesgos de seguridad y áreas de mejora'
          };
          break;
      }

      console.log('Enviando solicitud a:', currentUseCase.endpoint, body);
      
      const response = await fetch(currentUseCase.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Respuesta recibida:', data);
      
      setResponse(data);
      
    } catch (err) {
      console.error('Error:', err);
      const message = err instanceof Error ? err.message : 'Error al procesar la solicitud. Asegúrate que el backend esté corriendo en puerto 3000';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = () => {
    if (!response) return null;
    
    const analysis = response.analysis || response.structured?.summary || response.rawModelResponse;
    const structured = response.structured;
    const provider = response.provider;
    const model = response.model;
    
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 font-mono text-sm whitespace-pre-wrap">
          {analysis}
        </div>
        
        {structured && (
          <details className="text-sm">
            <summary className="cursor-pointer text-cyan-600 dark:text-cyan-400 font-mono hover:underline">
              Ver análisis estructurado
            </summary>
            <pre className="mt-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto text-xs font-mono">
              {JSON.stringify(structured, null, 2)}
            </pre>
          </details>
        )}
        
        {provider && (
          <div className="text-right">
            <span className="text-xs font-mono text-gray-500">
              Procesado con: {provider} / {model}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="demo" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 scientific-grid opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-4">
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">INTERACTIVE DEMO</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Prueba la <span className="gradient-text">IA en acción</span>
          </h2>
          <p className="text-gray-700 dark:text-gray-400 max-w-2xl mx-auto font-mono">
            Selecciona un caso de uso y experimenta con nuestra inteligencia artificial en tiempo real
          </p>
        </motion.div>

        {/* Selector de casos de uso */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {useCases.map((useCase) => (
            <motion.button
              key={useCase.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveCase(useCase.id);
                setResponse(null);
                setError(null);
                setInput('');
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono text-sm transition-all duration-300 ${
                activeCase === useCase.id
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'border border-cyan-500/30 text-gray-700 dark:text-gray-300 hover:bg-cyan-500/10'
              }`}
            >
              {useCase.icon}
              {useCase.title}
            </motion.button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Descripción del caso */}
          <motion.div
            key={activeCase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-scientific rounded-xl p-6 mb-6 border border-cyan-500/20"
          >
            <p className="text-gray-700 dark:text-gray-300 font-mono text-sm mb-4">
              {currentUseCase.description}
            </p>
            
            {/* Input area */}
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentUseCase.placeholder}
                className="w-full p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all font-mono text-sm resize-y"
                rows={activeCase === 'csv' ? 8 : 6}
              />
              
              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExample}
                  className="px-4 py-2 rounded-lg border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all font-mono text-sm"
                >
                  Usar ejemplo
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-mono text-sm"
                >
                  Limpiar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    'Analizar con IA'
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Resultados */}
          <AnimatePresence>
            {(response || error) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-scientific rounded-xl p-6 border border-cyan-500/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  {response ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {response ? 'Resultado del análisis' : 'Error en el análisis'}
                  </h3>
                </div>
                
                {response && formatResponse()}
                
                {error && (
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-500/30 text-red-700 dark:text-red-400 font-mono text-sm">
                    {error}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nota sobre el backend */}
          <div className="mt-6 text-center">
            <p className="text-xs font-mono text-gray-500">
              💡 Demo interactiva | {!response && !error ? 'Ingresa datos para probar la IA' : 'Resultados en tiempo real'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveUseCases;