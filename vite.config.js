/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Configuración para manejar errores cuando el backend no está disponible
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('⚠️ Backend no disponible, usando modo demo:', err.message);
            // Si el backend no responde, devolvemos datos mock
            if (!res.headersSent) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              
              // Detectar qué endpoint se está llamando para dar respuestas adecuadas
              const url = _req.url || '';
              
              let mockResponse = {};
              
              if (url.includes('/results/analyze')) {
                mockResponse = {
                  analysis: "✅ [MODO DEMO] Análisis de datos completado. En la versión completa, aquí verías estadísticas detalladas, correlaciones y visualizaciones automáticas de tus experimentos.",
                  structured: {
                    narrativeSummary: "Los datos muestran una tendencia clara en los parámetros analizados. Se recomienda validar con pruebas adicionales.",
                    notableFindings: ["Patrón consistente en mediciones", "Valores dentro del rango esperado"],
                    qualityFlags: ["Datos completos", "Sin outliers detectados"],
                    followUpQuestions: ["¿Deseas comparar con experimentos anteriores?", "¿Necesitas exportar estos resultados?"]
                  },
                  provider: "demo-mode",
                  model: "sapient-lab-demo",
                  generatedAt: new Date().toISOString()
                };
              } 
              else if (url.includes('/protocol/interpret')) {
                mockResponse = {
                  analysis: "🔬 [MODO DEMO] Protocolo analizado exitosamente. El asistente identificó los pasos críticos y generó un checklist de seguridad automatizado.",
                  structured: {
                    summary: "Protocolo validado con los estándares de seguridad del laboratorio.",
                    checklist: [
                      { action: "Verificar EPP completo", status: "pendiente", riskLevel: "alto" },
                      { action: "Preparar área de trabajo", status: "pendiente", riskLevel: "medio" },
                      { action: "Validar reactivos", status: "pendiente", riskLevel: "alto" }
                    ],
                    hazards: ["Contacto con químicos corrosivos", "Manipulación de muestras biológicas"],
                    riskLevel: "medio"
                  },
                  provider: "demo-mode",
                  model: "sapient-lab-demo",
                  generatedAt: new Date().toISOString()
                };
              }
              else if (url.includes('/images/analyze')) {
                mockResponse = {
                  analysis: "🖼️ [MODO DEMO] Análisis de imagen completado. Se detectaron elementos relevantes para la seguridad del laboratorio.",
                  structured: {
                    summary: "Imagen analizada correctamente. Se identificaron los elementos principales.",
                    findings: {
                      objects: ["Botella química", "Guantes de protección", "Microscopio"],
                      safety_signals: ["EPP visible", "Área de trabajo ordenada"],
                      anomalies: []
                    },
                    recommendations: ["Mantener el área despejada", "Verificar fechas de caducidad"]
                  },
                  provider: "demo-mode",
                  model: "sapient-lab-demo",
                  generatedAt: new Date().toISOString()
                };
              }
              else if (url.includes('/copilot/chat')) {
                mockResponse = {
                  analysis: "💬 [MODO DEMO] El asistente ha procesado tu consulta. En la versión completa, podrás interactuar con IA en tiempo real, obtener explicaciones detalladas y sugerencias personalizadas para tu investigación.",
                  structured: {
                    summary: "Respuesta generada en modo demostración. Conecta el backend para ver funcionalidad completa.",
                    suggestions: ["Revisar documentación asociada", "Validar con datos experimentales"],
                    confidence: 0.95
                  },
                  provider: "demo-mode",
                  model: "sapient-lab-demo",
                  generatedAt: new Date().toISOString()
                };
              }
              else {
                mockResponse = {
                  analysis: "🎯 [MODO DEMO] Sapient Lab AI está listo para demostración. Conecta el backend (puerto 3000) para acceder a todas las funcionalidades avanzadas.",
                  structured: {
                    summary: "Plataforma en modo demostración",
                    features: ["Análisis de CSV", "Interpretación de protocolos", "Análisis de imágenes", "Chat con IA"]
                  },
                  provider: "demo-mode",
                  model: "sapient-lab-demo",
                  generatedAt: new Date().toISOString()
                };
              }
              
              res.end(JSON.stringify(mockResponse));
            }
          });
        }
      }
    }
  }
})
