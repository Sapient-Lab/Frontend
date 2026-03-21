export type BaseAiRequest = {
  provider?: 'mistral' | 'deepseek';
};

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export const aiService = {
  /**
   * Obtiene el estado de los proveedores IA disponibles
   */
  async checkStatus() {
    const response = await fetch('/api/ai/providers/status');
    if (!response.ok) throw new Error('Error al conectar con el backend de IA');
    return response.json();
  },

  /**
   * Envía un mensaje al endpoint conversacional del backend
   * Ajustar la estructura según como la pida exactamente tu controlador NestJS
   */
  async sendMessage(message: string, provider: 'mistral' | 'deepseek' = 'mistral') {
    const response = await fetch('/api/ai/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Suponemos que el backend acepta esto, si pide "messages" como arreglo se puede ajustar
      body: JSON.stringify({ message, provider }), 
    });

    if (!response.ok) throw new Error('Error en el chat de IA');
    return response.json();
  },

  /**
   * Completado de código estilo Copilot
   */
  async getCopilotCompletion(instruction: string, prefix: string, suffix: string) {
    const response = await fetch('/api/ai/copilot/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'deepseek', // deepseek es mejor para código según el README
        language: 'typescript',
        prefix,
        suffix,
        instruction,
        maxSuggestions: 1
      }),
    });

    if (!response.ok) throw new Error('Error en copilot completions');
    return response.json();
  },

  /**
   * Análisis de datos (CSV o texto plano)
   */
  async analyzeResults(payload: string, format: 'text' | 'csv' = 'csv') {
    const response = await fetch('/api/ai/results/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, format, provider: 'mistral' })
    });
    if (!response.ok) throw new Error('Error al analizar los resultados');
    return response.json();
  },

  /**
   * Visión Artificial para imágenes del laboratorio
   */
  async analyzeImage(base64Image: string, prompt?: string) {
    const response = await fetch('/api/ai/images/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Image, prompt, provider: 'mistral' })
    });
    if (!response.ok) throw new Error('Error al analizar la imagen');
    return response.json();
  },

  /**
   * Asistente para explicar código o diagnosticar errores
   */
  async explainCode(code: string, question?: string, filePath?: string) {
    const response = await fetch('/api/ai/copilot/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, question, filePath, provider: 'deepseek' }) // Usamos DeepSeek para código
    });
    if (!response.ok) throw new Error('Error al explicar el código');
    return response.json();
  },

  /**
   * Escáner de protocolos de seguridad
   */
  async interpretProtocol(protocolText: string) {
    const response = await fetch('/api/ai/protocol/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ protocolText, riskLevel: 'medium', provider: 'mistral' })
    });
    if (!response.ok) throw new Error('Error al escanear el protocolo');
    return response.json();
  }
};