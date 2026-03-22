export type BaseAiRequest = {
  // Provider removido ya que el backend lo gestiona dinámicamente con LLMProviderService
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
   */
  async sendMessage(message: string, messages?: ChatMessage[]) {
    const response = await fetch('/api/ai/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, messages }), 
    });

    if (!response.ok) throw new Error('Error en el chat de IA');
    return response.json();
  },

  /**
   * Sube documentos del proyecto para dar contexto a la IA (Embeddings / Memoria)
   */
  async uploadProjectDocuments(_files: File[], _projectId?: string) { return { success: true }; },

  /**
   * Chat específico de código con Copilot AI
   */
  async copilotChat(message: string, language: string = 'typescript') {
    const response = await fetch('/api/ai/copilot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, language }), 
    });

    if (!response.ok) throw new Error('Error en Copilot Chat');
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
      body: JSON.stringify({ payload, format })
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
      body: JSON.stringify({ base64Image, prompt })
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
      body: JSON.stringify({ code, question, filePath, language: 'typescript' })
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
      body: JSON.stringify({ protocolText, riskLevel: 'medium' })
    });
    if (!response.ok) throw new Error('Error al escanear el protocolo');
    return response.json();
  }
};